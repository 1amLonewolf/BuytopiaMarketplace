const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   POST /api/webhooks/stripe
// @desc    Handle Stripe Checkout completion
// @access  Public (verified via signature)
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Idempotency check — prevent duplicate orders from webhook retries
    const existingOrder = await Order.findOne({ 'paymentResult.id': session.payment_intent });
    if (existingOrder) {
      console.log(`⚠️  Duplicate webhook: order ${existingOrder._id} already exists for payment ${session.payment_intent}`);
      return res.json({ received: true });
    }

    const { userId, itemsJSON, shippingAddressJSON, itemsPrice, shippingPrice, totalPrice } = session.metadata;

    try {
      // Parse metadata
      const orderItems = JSON.parse(itemsJSON);
      const shippingAddress = JSON.parse(shippingAddressJSON);

      // Ensure zipCode exists (Schema requires it, but Kenyan forms might not send it)
      if (!shippingAddress.zipCode) {
        shippingAddress.zipCode = "00100"; // Default to Nairobi
      }

      // Validate metadata exists
      if (!itemsPrice || !shippingPrice || !totalPrice) {
        throw new Error('Missing required metadata fields');
      }

      // Generate Order Number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create Order in DB
      const order = await Order.create({
        orderNumber,
        user: userId,
        items: orderItems,
        shippingAddress,
        paymentMethod: 'Stripe',
        itemsPrice: parseFloat(itemsPrice),
        shippingPrice: parseFloat(shippingPrice),
        totalPrice: parseFloat(totalPrice),
        taxPrice: 0,
        isPaid: true,
        paidAt: new Date(),
        status: 'processing',
        paymentResult: {
          id: session.payment_intent,
          status: 'succeeded',
          email_address: session.customer_details?.email || ''
        }
      });

      // Deduct inventory & increment sales
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { inventory: -item.quantity, totalSales: item.quantity }
          });
        } else {
          console.warn(`⚠️  Product ${item.product} not found — skipped inventory deduction`);
        }
      }

      console.log(`✅ Order ${order._id} created & paid via Stripe`);
    } catch (err) {
      console.error('❌ Webhook Order Creation Error:', err);
      // Return 500 so Stripe retries the webhook
      return res.status(500).send('Webhook handler failed');
    }
  }

  res.json({ received: true });
});

module.exports = router;
