const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Lazy-init Stripe — only when key is available
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set — Stripe routes will be disabled');
}

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, [
  body('items').isArray({ min: 1 }).withMessage('Cart must contain at least one item'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('paymentMethod').isString().notEmpty().withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items and calculate totals
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.product} not found` 
        });
      }

      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      itemsPrice += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
        vendor: product.vendor
      });
    }

    // Calculate prices
    const taxPrice = 0; // No tax
    const shippingPrice = itemsPrice > 50 ? 0 : 10; // Free shipping over KSh 50
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Create order
    // Ensure zipCode exists
    if (!shippingAddress.zipCode) {
      shippingAddress.zipCode = "00100";
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    // Update product inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: -item.quantity, totalSales: item.quantity }
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get logged in user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/admin
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('items.vendor', 'name vendorProfile');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order or is a vendor/admin
    if (
      order.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      const isVendor = order.items.some(item => 
        item.vendor && item.vendor._id.toString() === req.user.id
      );
      
      if (!isVendor) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to view this order' 
        });
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentIntentId,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email
    };
    order.status = 'processing';

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (vendor/admin only)
// @access  Private/Vendor/Admin
router.put('/:id/status', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      
      // Update vendor sales
      for (const item of order.items) {
        await User.findByIdAndUpdate(item.vendor, {
          $inc: { 'vendorProfile.totalSales': item.quantity }
        });
      }
    }

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders/:id/refund
// @desc    Refund an order
// @access  Private/Admin
router.post('/:id/refund', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order not paid' });
    }

    // Refund via Stripe
    if (order.paymentResult && order.paymentResult.id) {
      await stripe.refunds.create({
        payment_intent: order.paymentResult.id
      });
    }

    order.status = 'refunded';
    await order.save();

    // Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: item.quantity, totalSales: -item.quantity }
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders/checkout-session
// @desc    Create Stripe Checkout Session
// @access  Private
router.post('/checkout-session', protect, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.' });
  }

  try {
    const { items, shippingAddress } = req.body;

    // 1. Validate items & check inventory
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.inventory < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
      }
      itemsPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
        vendor: product.vendor
      });
    }

    // 2. Calculate totals
    const shippingPrice = itemsPrice > 50 ? 0 : 10;
    const totalPrice = itemsPrice + shippingPrice;

    // 3. Deduct inventory IMMEDIATELY (prevents race conditions)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: -item.quantity, totalSales: item.quantity }
      });
    }

    // 4. Create order in DB as "pending" (so it exists even if webhook is delayed)
    // Ensure zipCode exists
    if (!shippingAddress.zipCode) {
      shippingAddress.zipCode = "00100"; // Default to Nairobi
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'Stripe',
      itemsPrice,
      shippingPrice,
      totalPrice,
      taxPrice: 0,
      isPaid: false,
      status: 'pending'
    });

    // 5. Create Stripe Checkout Session with order ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: orderItems.map(item => ({
        price_data: {
          currency: 'kes',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity
      })),
      shipping_address_collection: {
        allowed_countries: ['KE', 'US', 'GB', 'CA', 'AU']
      },
      customer_email: req.user.email,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout?success=true&orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?canceled=true`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });

    res.json({ success: true, url: session.url, orderId: order._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
