const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Load env variables
dotenv.config();

// Debug: Check if env vars are loaded
console.log('🔍 ENV CHECK:', {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `✅ SET (${process.env.STRIPE_SECRET_KEY.substring(0, 8)}...)` : '❌ MISSING',
  MONGODB_URI: process.env.MONGODB_URI ? `✅ SET (${process.env.MONGODB_URI.substring(0, 20)}...)` : '❌ MISSING',
  JWT_SECRET: process.env.JWT_SECRET ? `✅ SET (${process.env.JWT_SECRET.substring(0, 8)}...)` : '❌ MISSING',
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY ? `✅ SET (${process.env.MPESA_CONSUMER_KEY.substring(0, 8)}...)` : '❌ MISSING',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING',
  NODE_ENV: process.env.NODE_ENV || '❌ MISSING',
  CLIENT_URL: process.env.CLIENT_URL || '❌ MISSING',
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const vendorRoutes = require('./routes/vendors');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const webhookRoutes = require('./routes/webhooks');
const mpesaRoutes = require('./routes/mpesa');

const app = express();

// Rate limiting - stricter for auth routes
const isDevelopment = process.env.NODE_ENV === 'development';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // More lenient in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 20, // More lenient in development
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Helmet - security HTTP headers
app.use(helmet());

// Webhook needs raw body before JSON parsing
app.use('/api/webhooks', webhookRoutes);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent NoSQL injection (sanitizes $ and . in request body data)
// Custom middleware compatible with Express 5
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  for (const key in obj) {
    if (key.includes('.') || key.startsWith('$')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    sanitizeObject(req.body);
  }
  next();
});

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', uploadRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Buytopia Marketplace API is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware (centralized)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Database connection
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.error('Failed to start server. Please ensure MongoDB is running.');
    console.error('To start MongoDB, run: net start MongoDB');
    process.exit(1);
  }
};

startServer();

module.exports = app;
