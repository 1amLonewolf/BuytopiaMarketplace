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
    const { userId, itemsJSON, shippingAddressJSON, itemsPrice, shippingPrice, totalPrice } = session.metadata;

    try {
      // 1. Parse metadata
      const orderItems = JSON.parse(itemsJSON);
      const shippingAddress = JSON.parse(shippingAddressJSON);

      // FIX 1: Ensure zipCode exists (Schema requires it, but Kenyan forms might not send it)
      if (!shippingAddress.zipCode) {
        shippingAddress.zipCode = "00100"; // Default to Nairobi
      }

      // FIX 2: Generate Order Number manually to bypass validation requirement
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 2. Create Order in DB
      const order = await Order.create({
        orderNumber: orderNumber, // Manually set to satisfy validation
        user: userId,
        items: orderItems,
        shippingAddress: shippingAddress,
        paymentMethod: 'Stripe',
        itemsPrice: parseFloat(itemsPrice),
        shippingPrice: parseFloat(shippingPrice),
        totalPrice: parseFloat(totalPrice),
        isPaid: true,
        paidAt: new Date(),
        status: 'processing',
        paymentResult: {
          id: session.payment_intent,
          status: 'paid',
          email_address: session.customer_details?.email || ''
        }
      });

      // 3. Deduct inventory & increment sales
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { inventory: -item.quantity, totalSales: item.quantity }
        });
      }

      console.log(`✅ Order ${order._id} created & paid via Stripe`);
    } catch (err) {
      console.error('❌ Webhook Order Creation Error:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
