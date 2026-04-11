const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/vendors
// @desc    Get all vendors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const vendors = await User.find({ 
      role: 'vendor',
      'vendorProfile.isApproved': true 
    })
    .select('name email avatar vendorProfile createdAt')
    .sort({ 'vendorProfile.rating': -1 });

    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get vendor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await User.findOne({ 
      _id: req.params.id,
      role: 'vendor'
    }).select('-password');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/vendors/:id/products
// @desc    Get vendor's products
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Product.find({ 
      vendor: req.params.id,
      status: 'active'
    })
    .populate('vendor', 'name avatar vendorProfile')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/vendors/dashboard/stats
// @desc    Get vendor dashboard statistics
// @access  Private/Vendor
router.get('/dashboard/stats', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get vendor's products
    const products = await Product.find({ vendor: vendorId });
    const productIds = products.map(p => p._id);

    // Get orders containing vendor's products
    const orders = await Order.find({ 
      'items.vendor': vendorId,
      status: { $ne: 'cancelled' }
    });

    // Calculate stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalOrders = orders.length;
    const totalSales = products.reduce((sum, p) => sum + (p.totalSales || 0), 0);
    const totalRevenue = orders.reduce((sum, order) => {
      const vendorItems = order.items.filter(item => 
        item.vendor && item.vendor.toString() === vendorId
      );
      const vendorTotal = vendorItems.reduce((itemSum, item) => 
        itemSum + (item.price * item.quantity), 0
      );
      return sum + vendorTotal;
    }, 0);

    // Recent orders
    const recentOrders = await Order.find({ 'items.vendor': vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalSales,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/vendors/analytics
// @desc    Get vendor analytics with time-series data
// @access  Private (Vendor only)
router.get('/analytics', protect, async (req, res) => {
  try {
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { range = '30' } = req.query;
    const days = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vendorId = req.user._id;

    // Get vendor's products
    const products = await Product.find({ vendor: vendorId });
    const productIds = products.map(p => p._id);

    // Get orders within date range
    const orders = await Order.find({
      'items.vendor': vendorId,
      status: { $ne: 'cancelled' },
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Build daily data points
    const dailyData = {};
    const today = new Date();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      dailyData[key] = {
        date: key,
        orders: 0,
        revenue: 0,
        sales: 0
      };
    }

    // Fill with actual data
    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyData[key]) continue;

      const vendorItems = order.items.filter(item =>
        item.vendor && item.vendor.toString() === vendorId.toString()
      );
      const orderRevenue = vendorItems.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
      );
      const orderSales = vendorItems.reduce((sum, item) =>
        sum + item.quantity, 0
      );

      dailyData[key].orders += 1;
      dailyData[key].revenue += orderRevenue;
      dailyData[key].sales += orderSales;
    }

    // Products added over time
    const productsByDate = await Product.aggregate([
      { $match: { vendor: vendorId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Add products data
    const productsAdded = {};
    productsByDate.forEach(p => { productsAdded[p._id] = p.count; });

    // Build cumulative products count
    let cumulativeProducts = 0;
    const productsBefore = await Product.countDocuments({
      vendor: vendorId,
      createdAt: { $lt: startDate }
    });
    cumulativeProducts = productsBefore;

    const analyticsData = Object.values(dailyData).map(day => {
      cumulativeProducts += productsAdded[day.date] || 0;
      return {
        ...day,
        products: cumulativeProducts
      };
    });

    // --- Product Interest Analytics ---
    const topProducts = await Product.find({ vendor: vendorId })
      .sort({ views: -1 })
      .limit(6);
    
    const topProductIds = topProducts.map(p => p._id);

    // Count how many users have each product in their wishlist
    const wishlistCounts = await User.aggregate([
      { $match: { wishlist: { $in: topProductIds } } },
      { $unwind: '$wishlist' },
      { $match: { wishlist: { $in: topProductIds } } },
      { $group: { _id: '$wishlist', count: { $sum: 1 } } }
    ]);

    const wishlistMap = {};
    wishlistCounts.forEach(item => {
      wishlistMap[item._id.toString()] = item.count;
    });

    const topProductsData = topProducts.map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      views: p.views || 0,
      wishlistAdds: wishlistMap[p._id.toString()] || 0
    }));

    res.json({ success: true, data: analyticsData, topProducts: topProductsData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/vendors/apply
// @desc    Apply to become a vendor
// @access  Private
router.post('/apply', protect, [
  body('storeName').trim().notEmpty().withMessage('Store name is required'),
  body('storeDescription').trim().notEmpty().withMessage('Store description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (req.user.role === 'vendor') {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a vendor' 
      });
    }

    const { storeName, storeDescription } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        role: 'vendor',
        vendorProfile: {
          storeName,
          storeDescription,
          isApproved: false
        }
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: 'Vendor application submitted. Waiting for admin approval.',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
