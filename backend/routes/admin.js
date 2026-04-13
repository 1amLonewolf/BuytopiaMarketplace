const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const pendingVendors = await User.find({
      role: 'vendor',
      'vendorProfile.isApproved': false
    }).select('name email vendorProfile createdAt');

    res.json({
      success: true,
      data: {
        totalUsers,
        totalVendors,
        totalCustomers,
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        pendingVendors
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get admin platform analytics with time-series data
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const { range = '30' } = req.query;
    const days = parseInt(range);

    // Use UTC dates for consistency with MongoDB
    const now = new Date();
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // Today midnight UTC
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - days + 1); // Include today

    // Get orders within date range
    const orders = await Order.find({
      status: { $ne: 'cancelled' },
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Build daily data points
    const dailyData = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + i);
      const key = date.toISOString().split('T')[0];
      dailyData[key] = {
        date: key,
        orders: 0,
        revenue: 0,
        newUsers: 0,
        newVendors: 0,
        newProducts: 0
      };
    }

    // Fill orders data
    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyData[key]) continue;
      dailyData[key].orders += 1;
      if (order.isPaid) {
        dailyData[key].revenue += order.totalPrice;
      }
    }

    // Get new users per day
    const newUsers = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    newUsers.forEach(u => { if (dailyData[u._id]) dailyData[u._id].newUsers = u.count; });

    // Get new vendors per day
    const newVendors = await User.aggregate([
      { $match: { role: 'vendor', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    newVendors.forEach(v => { if (dailyData[v._id]) dailyData[v._id].newVendors = v.count; });

    // Get new products per day
    const newProducts = await Product.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    newProducts.forEach(p => { if (dailyData[p._id]) dailyData[p._id].newProducts = p.count; });

    const analyticsData = Object.values(dailyData);
    console.log(`📊 Admin analytics: ${days} days, ${analyticsData[analyticsData.length - 1]?.date} — users: ${analyticsData.reduce((s, d) => s + d.newUsers, 0)}, products: ${analyticsData.reduce((s, d) => s + d.newProducts, 0)}, orders: ${analyticsData.reduce((s, d) => s + d.orders, 0)}`);

    res.json({ success: true, data: analyticsData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: users,
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

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/vendors/pending
// @desc    Get pending vendor applications
// @access  Private/Admin
router.get('/vendors/pending', async (req, res) => {
  try {
    const vendors = await User.find({
      role: 'vendor',
      'vendorProfile.isApproved': false
    }).select('name email vendorProfile createdAt');

    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/vendors/:id/approve
// @desc    Approve vendor application
// @access  Private/Admin
router.put('/vendors/:id/approve', async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { 'vendorProfile.isApproved': true },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments();

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

// @route   GET /api/admin/products
// @desc    Get all products
// @access  Private/Admin
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate('vendor', 'name email vendorProfile')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments();

    res.json({
      success: true,
      data: products,
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

// @route   PUT /api/admin/products/:id/featured
// @desc    Toggle product featured status
// @access  Private/Admin
router.put('/products/:id/featured', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews
// @access  Private/Admin
router.get('/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate('user', 'name avatar')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments();

    res.json({
      success: true,
      data: reviews,
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

module.exports = router;
