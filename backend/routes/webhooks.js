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
    const { orderId } = session.metadata;

    try {
      if (!orderId) {
        throw new Error('Missing orderId in session metadata');
      }

      // Find the existing order (created during checkout session)
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Idempotency check — prevent double payment
      if (order.isPaid) {
        console.log(`⚠️  Duplicate webhook: order ${order._id} already marked as paid`);
        return res.json({ received: true });
      }

      // Mark order as paid (use findByIdAndUpdate to skip validation)
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: new Date(),
        status: 'processing',
        paymentResult: {
          id: session.payment_intent,
          status: 'succeeded',
          email_address: session.customer_details?.email || ''
        }
      });

      console.log(`✅ Order ${order._id} marked as paid via Stripe webhook`);
    } catch (err) {
      console.error('❌ Webhook Order Update Error:', err);
      return res.status(500).send('Webhook handler failed');
    }
  }

  // Handle canceled checkout — restore inventory
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const { orderId } = session.metadata;

    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid && order.status === 'pending') {
          // Restore inventory
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { inventory: item.quantity, totalSales: -item.quantity }
            });
          }
          await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
          console.log(`🔄 Order ${order._id} cancelled — inventory restored`);
        }
      } catch (err) {
        console.error('❌ Webhook Cancel Error:', err);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
