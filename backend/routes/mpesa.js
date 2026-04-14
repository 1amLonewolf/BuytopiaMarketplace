const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const PASSKEY = process.env.MPESA_PASSKEY;

/**
 * Helper: Generate M-Pesa password (Base64 of Shortcode + Passkey + Timestamp)
 */
const generatePassword = () => {
  const timestamp = new Date();
  const formattedTimestamp = timestamp.getFullYear() +
    ('0' + (timestamp.getMonth() + 1)).slice(-2) +
    ('0' + timestamp.getDate()).slice(-2) +
    ('0' + timestamp.getHours()).slice(-2) +
    ('0' + timestamp.getMinutes()).slice(-2) +
    ('0' + timestamp.getSeconds()).slice(-2);

  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${formattedTimestamp}`).toString('base64');
  return { password, timestamp: formattedTimestamp };
};

/**
 * Helper: Get M-Pesa access token
 */
const getAccessToken = async () => {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get M-Pesa access token: ${data.error_description || data.errorMessage}`);
  }

  return data.access_token;
};

/**
 * POST /api/mpesa/stk-push
 * Initiate STK Push to customer's phone
 */
router.post('/stk-push', protect, async (req, res) => {
  try {
    const { phoneNumber, amount, orderId } = req.body;

    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, amount, and orderId are required'
      });
    }

    // Format phone number to 254XXXXXXXXX
    const formattedPhone = phoneNumber.startsWith('0')
      ? '254' + phoneNumber.slice(1)
      : phoneNumber.startsWith('254')
      ? phoneNumber
      : '254' + phoneNumber;

    // Validate order exists and belongs to user
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    // Get access token
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    // Initiate STK Push
    const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback',
        AccountReference: `Buytopia-${order.orderNumber || order._id}`,
        TransactionDesc: `Payment for order ${order.orderNumber || order._id}`
      })
    });

    const data = await response.json();

    if (!response.ok || data.errorCode) {
      console.error('M-Pesa STK Push Error:', data);
      return res.status(400).json({
        success: false,
        message: data.errorMessage || 'Failed to initiate STK Push'
      });
    }

    console.log(`✅ STK Push initiated for order ${orderId}: ${data.CheckoutRequestID}`);

    res.json({
      success: true,
      data: {
        CheckoutRequestID: data.CheckoutRequestID,
        merchantRequestId: data.merchantRequestId,
        message: data.CustomerMessage || 'STK Push sent successfully'
      }
    });
  } catch (error) {
    console.error('M-Pesa STK Push Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate M-Pesa payment'
    });
  }
});

/**
 * POST /api/mpesa/callback
 * Receive M-Pesa callback after STK Push completion
 */
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      console.log('⚠️  Invalid M-Pesa callback received:', JSON.stringify(req.body));
      return res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;

    console.log(`📩 M-Pesa Callback: CheckoutRequestID=${CheckoutRequestID}, ResultCode=${ResultCode}`);

    if (ResultCode === 0) {
      // Payment successful
      const callbackMetadata = Body.stkCallback.CallbackMetadata?.Item || [];

      const getMetadataValue = (name) => {
        const item = callbackMetadata.find(m => m.Name === name);
        return item ? item.Value : null;
      };

      const amount = getMetadataValue('Amount');
      const mpesaReceiptNumber = getMetadataValue('MpesaReceiptNumber');
      const transactionDate = getMetadataValue('TransactionDate');
      const phoneNumber = getMetadataValue('PhoneNumber');

      // Find order by CheckoutRequestID (stored in notes field)
      const order = await Order.findOne({ notes: `stk-push:${CheckoutRequestID}` });

      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'processing';
        order.paymentMethod = 'M-Pesa';
        order.paymentResult = {
          id: mpesaReceiptNumber || CheckoutRequestID,
          status: 'succeeded',
          email_address: phoneNumber?.toString() || ''
        };
        order.notes = `Paid via M-Pesa: ${mpesaReceiptNumber}`;

        await order.save();
        console.log(`✅ Order ${order._id} marked as paid via M-Pesa: ${mpesaReceiptNumber}`);
      } else {
        console.warn(`⚠️  Order not found for CheckoutRequestID: ${CheckoutRequestID}`);
      }
    } else {
      // Payment failed or canceled
      console.log(`❌ M-Pesa payment failed: ${ResultDesc}`);

      // Find and cancel the pending order
      const order = await Order.findOne({ notes: `stk-push:${CheckoutRequestID}` });
      if (order && !order.isPaid && order.status === 'pending') {
        // Restore inventory
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { inventory: item.quantity, totalSales: -item.quantity }
          });
        }
        order.status = 'cancelled';
        order.notes = `M-Pesa payment failed: ${ResultDesc}`;
        await order.save();
        console.log(`🔄 Order ${order._id} cancelled — inventory restored`);
      }
    }

    // Always respond with success to Safaricom
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('❌ M-Pesa Callback Error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
});

/**
 * GET /api/mpesa/status/:checkoutRequestID
 * Query STK Push transaction status
 */
router.get('/status/:checkoutRequestID', protect, async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;

    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: generatePassword().password,
        Timestamp: generatePassword().timestamp,
        CheckoutRequestID: checkoutRequestID
      })
    });

    const data = await response.json();

    if (!response.ok || data.errorCode) {
      return res.status(400).json({
        success: false,
        message: data.errorMessage || 'Failed to query transaction status'
      });
    }

    res.json({
      success: true,
      data: {
        ResultCode: data.ResultCode,
        ResultDesc: data.ResultDesc,
        CheckoutRequestID: checkoutRequestID
      }
    });
  } catch (error) {
    console.error('M-Pesa Status Query Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to query transaction status'
    });
  }
});

module.exports = router;
