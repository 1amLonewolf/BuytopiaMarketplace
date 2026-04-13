/**
 * Seed script — populates DB with test users, products, and data
 * Run: node backend/scripts/seed.js
 * Safe to run multiple times — clears existing test data first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const TEST_IMAGES = [];
for (let i = 1; i <= 80; i++) {
  TEST_IMAGES.push(`https://picsum.photos/seed/prod${i}/600/600`);
}

const TEST_USERS = [
  {
    name: 'Admin User',
    email: 'admin@buytopia.co.ke',
    password: 'admin123',
    role: 'admin',
    phone: '+254 700 000 001',
    isActive: true,
  },
  {
    name: 'Test Customer',
    email: 'customer@test.co.ke',
    password: 'customer123',
    role: 'customer',
    phone: '+254 700 000 002',
    isActive: true,
  },
  {
    name: 'Nairobi Electronics',
    email: 'vendor1@test.co.ke',
    password: 'vendor123',
    role: 'vendor',
    phone: '+254 700 000 003',
    isActive: true,
    vendorProfile: {
      storeName: 'Nairobi Electronics Hub',
      storeDescription: 'Your one-stop shop for phones, laptops, and accessories.',
      isApproved: true,
      rating: 4.7,
      totalSales: 150,
    },
  },
  {
    name: 'Fashion Kenya',
    email: 'vendor2@test.co.ke',
    password: 'vendor123',
    role: 'vendor',
    phone: '+254 700 000 004',
    isActive: true,
    vendorProfile: {
      storeName: 'Fashion Kenya Store',
      storeDescription: 'Trendy clothing and accessories for men and women.',
      isApproved: true,
      rating: 4.3,
      totalSales: 89,
    },
  },
  {
    name: 'Home & Kitchen Plus',
    email: 'vendor3@test.co.ke',
    password: 'vendor123',
    role: 'vendor',
    phone: '+254 700 000 005',
    isActive: true,
    vendorProfile: {
      storeName: 'Home & Kitchen Plus',
      storeDescription: 'Quality appliances, cookware, and home essentials.',
      isApproved: true,
      rating: 4.5,
      totalSales: 200,
    },
  },
  {
    name: 'Mombasa Fresh Mart',
    email: 'vendor4@test.co.ke',
    password: 'vendor123',
    role: 'vendor',
    phone: '+254 700 000 006',
    isActive: true,
    vendorProfile: {
      storeName: 'Mombasa Fresh Mart',
      storeDescription: 'Fresh groceries, spices, and gourmet foods delivered daily.',
      isApproved: true,
      rating: 4.8,
      totalSales: 320,
    },
  },
  {
    name: 'Glow Beauty KE',
    email: 'vendor5@test.co.ke',
    password: 'vendor123',
    role: 'vendor',
    phone: '+254 700 000 007',
    isActive: true,
    vendorProfile: {
      storeName: 'Glow Beauty Kenya',
      storeDescription: 'Premium skincare, makeup, and hair care products.',
      isApproved: true,
      rating: 4.6,
      totalSales: 175,
    },
  },
  {
    name: 'Active Sports KE',
    email: 'vendor6@test.co.ke',
    password: 'vendor123',
    role: 'vendor',
    phone: '+254 700 000 008',
    isActive: true,
    vendorProfile: {
      storeName: 'Active Sports Kenya',
      storeDescription: 'Fitness gear, outdoor equipment, and sportswear.',
      isApproved: true,
      rating: 4.4,
      totalSales: 95,
    },
  },
  {
    name: 'BookHouse Nairobi',
    email: 'vendor7@test.co.ke',
    password: 'vendor123',
    role: 'vendor',
    phone: '+254 700 000 009',
    isActive: true,
    vendorProfile: {
      storeName: 'BookHouse Nairobi',
      storeDescription: 'African literature, business books, textbooks, and more.',
      isApproved: true,
      rating: 4.9,
      totalSales: 410,
    },
  },
];

const TEST_PRODUCTS = [
  // Electronics (vendor1)
  { name: 'iPhone 15 Pro Max 256GB', description: 'Latest Apple flagship with A17 Pro chip, titanium design, and 48MP camera system.', price: 189999, compareAtPrice: 210000, category: 'Electronics', subcategory: 'Phones', inventory: 15, tags: ['apple', 'smartphone', 'flagship'], isFeatured: true },
  { name: 'Samsung Galaxy S24 Ultra', description: 'Premium Android phone with S Pen, 200MP camera, and AI features.', price: 169999, compareAtPrice: 189999, category: 'Electronics', subcategory: 'Phones', inventory: 20, tags: ['samsung', 'smartphone'], isFeatured: true },
  { name: 'MacBook Air M3 15"', description: 'Ultra-thin laptop with M3 chip, 16GB RAM, 512GB SSD. Perfect for work and creative tasks.', price: 179999, category: 'Electronics', subcategory: 'Laptops', inventory: 8, tags: ['apple', 'laptop'], isFeatured: true },
  { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise cancellation with 30-hour battery life.', price: 42999, compareAtPrice: 49999, category: 'Electronics', subcategory: 'Audio', inventory: 35, tags: ['sony', 'headphones', 'wireless'] },
  { name: 'iPad Pro 12.9" M2', description: 'Powerful tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support.', price: 149999, category: 'Electronics', subcategory: 'Tablets', inventory: 12, tags: ['apple', 'tablet'] },
  { name: 'Dell XPS 15 Laptop', description: 'High-performance Windows laptop with Intel i7, 16GB RAM, RTX 4050.', price: 159999, compareAtPrice: 175000, category: 'Electronics', subcategory: 'Laptops', inventory: 6, tags: ['dell', 'laptop', 'windows'] },
  { name: 'AirPods Pro 2nd Gen', description: 'Active noise cancellation, adaptive audio, and personalized spatial audio.', price: 32999, category: 'Electronics', subcategory: 'Audio', inventory: 50, tags: ['apple', 'earbuds'] },
  { name: 'Samsung 55" Smart TV', description: 'Crystal UHD 4K Smart TV with Tizen OS, HDR, and built-in streaming apps.', price: 74999, compareAtPrice: 89999, category: 'Electronics', subcategory: 'TVs', inventory: 10, tags: ['samsung', 'tv', '4k'] },

  // Fashion (vendor2)
  { name: "Men's Leather Formal Shoes", description: 'Handcrafted genuine leather shoes with comfortable cushioned sole.', price: 4999, compareAtPrice: 6500, category: 'Fashion', subcategory: 'Men Shoes', inventory: 40, tags: ['leather', 'formal', 'shoes'] },
  { name: 'Women Maxi Dress — Floral Print', description: 'Elegant flowy maxi dress perfect for casual and semi-formal occasions.', price: 2499, category: 'Fashion', subcategory: 'Women Dresses', inventory: 60, tags: ['dress', 'women', 'casual'], isFeatured: true },
  { name: "Men's Slim Fit Chinos", description: 'Stretch cotton chinos with modern slim fit. Available in multiple colors.', price: 1999, compareAtPrice: 2800, category: 'Fashion', subcategory: 'Men Pants', inventory: 80, tags: ['chinos', 'men', 'pants'] },
  { name: 'Women Crossbody Leather Bag', description: 'Genuine leather crossbody bag with adjustable strap and multiple compartments.', price: 3999, category: 'Fashion', subcategory: 'Bags', inventory: 25, tags: ['leather', 'bag', 'women'], isFeatured: true },
  { name: 'Unisex Sneakers — Classic White', description: 'Clean minimalist sneakers for everyday wear. Comfortable rubber sole.', price: 3499, compareAtPrice: 4500, category: 'Fashion', subcategory: 'Sneakers', inventory: 45, tags: ['sneakers', 'unisex', 'white'] },
  { name: 'Women Gold Chain Necklace', description: '18K gold-plated layered chain necklace. Hypoallergenic and tarnish-resistant.', price: 1299, category: 'Fashion', subcategory: 'Jewelry', inventory: 100, tags: ['jewelry', 'gold', 'necklace'] },
  { name: "Men's Denim Jacket", description: 'Classic blue denim jacket with button closure and chest pockets.', price: 3999, category: 'Fashion', subcategory: 'Men Jackets', inventory: 30, tags: ['denim', 'jacket', 'men'] },
  { name: 'Silk Scarf — Abstract Print', description: 'Luxurious silk scarf with vibrant abstract pattern. Versatile styling.', price: 1899, compareAtPrice: 2500, category: 'Fashion', subcategory: 'Accessories', inventory: 55, tags: ['silk', 'scarf', 'accessories'] },

  // Home & Kitchen (vendor3)
  { name: 'Nespresso Vertuo Coffee Machine', description: 'One-touch coffee machine with Centrifusion technology. Makes espresso and lungo.', price: 24999, compareAtPrice: 29999, category: 'Home & Kitchen', subcategory: 'Appliances', inventory: 15, tags: ['coffee', 'nespresso', 'machine'], isFeatured: true },
  { name: 'Non-Stick Cookware Set 10-Piece', description: 'Complete cookware set with granite non-stick coating. Includes pots, pans, and lids.', price: 7999, category: 'Home & Kitchen', subcategory: 'Cookware', inventory: 25, tags: ['cookware', 'set', 'non-stick'] },
  { name: 'Robot Vacuum Cleaner', description: 'Smart robot vacuum with mopping function, app control, and auto-charging.', price: 34999, compareAtPrice: 42000, category: 'Home & Kitchen', subcategory: 'Cleaning', inventory: 8, tags: ['vacuum', 'robot', 'smart'] },
  { name: 'Egyptian Cotton Bed Sheet Set', description: 'Luxurious 600-thread-count Egyptian cotton sheets. King size, deep pocket.', price: 5999, category: 'Home & Kitchen', subcategory: 'Bedding', inventory: 40, tags: ['bedding', 'cotton', 'luxury'] },
  { name: 'Stainless Steel Knife Set', description: 'Professional 8-piece knife set with wooden block. High-carbon stainless steel.', price: 4499, compareAtPrice: 5500, category: 'Home & Kitchen', subcategory: 'Cutlery', inventory: 30, tags: ['knives', 'kitchen', 'professional'] },
  { name: 'LED Desk Lamp with USB Charger', description: 'Adjustable LED desk lamp with 5 brightness levels, color temperature control, and USB port.', price: 2499, category: 'Home & Kitchen', subcategory: 'Lighting', inventory: 50, tags: ['lamp', 'LED', 'desk'] },
  { name: 'Air Fryer 5.5L Digital', description: 'Large capacity air fryer with digital display, 8 presets, and non-stick basket.', price: 8999, compareAtPrice: 11000, category: 'Home & Kitchen', subcategory: 'Appliances', inventory: 20, tags: ['air fryer', 'cooking', 'healthy'] },
  { name: 'Decorative Throw Pillows Set of 4', description: 'Modern geometric pattern cushions with soft velvet cover. 18x18 inches.', price: 2999, category: 'Home & Kitchen', subcategory: 'Decor', inventory: 60, tags: ['pillows', 'decor', 'modern'] },

  // Groceries (vendor4)
  { name: 'Kenyan AA Coffee Beans 1kg', description: 'Premium single-origin Arabica from Nyeri Highlands. Medium roast, fruity notes.', price: 1200, category: 'Groceries', subcategory: 'Coffee & Tea', inventory: 80, tags: ['coffee', 'kenyan', 'arabica'], isFeatured: true },
  { name: 'Organic Honey 500ml', description: 'Raw unfiltered honey from Western Kenya highlands. No additives.', price: 850, compareAtPrice: 1100, category: 'Groceries', subcategory: 'Pantry', inventory: 100, tags: ['honey', 'organic', 'natural'] },
  { name: 'Masala Spice Set — 6 Jars', description: 'Authentic Kenyan spice blend: pilau, curry, cardamom, cinnamon, clove, and turmeric.', price: 950, category: 'Groceries', subcategory: 'Spices', inventory: 60, tags: ['spices', 'masala', 'kenyan'] },
  { name: 'Coconut Oil 500ml Cold Pressed', description: 'Virgin cold-pressed coconut oil for cooking and skincare.', price: 550, compareAtPrice: 700, category: 'Groceries', subcategory: 'Oils', inventory: 90, tags: ['coconut', 'oil', 'cold-pressed'] },
  { name: 'Ugali Flour 2kg (Premium Maize)', description: 'Finely milled premium white maize flour. Smooth and consistent ugali every time.', price: 250, category: 'Groceries', subcategory: 'Flour & Grains', inventory: 200, tags: ['maize', 'flour', 'ugali'] },
  { name: 'Basmati Rice 5kg', description: 'Aromatic long-grain basmati rice from the coast. Fluffy and fragrant.', price: 1800, compareAtPrice: 2200, category: 'Groceries', subcategory: 'Rice', inventory: 45, tags: ['rice', 'basmati', 'aromatic'] },
  { name: 'Mombasa Tea Chai Blend 250g', description: 'Rich and bold black tea blend perfect for Kenyan chai with milk.', price: 380, category: 'Groceries', subcategory: 'Coffee & Tea', inventory: 120, tags: ['tea', 'chai', 'mombasa'] },
  { name: 'Organic Avocado Oil 250ml', description: 'Cold-pressed avocado oil for salads and light cooking. High in vitamins.', price: 750, category: 'Groceries', subcategory: 'Oils', inventory: 70, tags: ['avocado', 'oil', 'organic'] },

  // Beauty & Health (vendor5)
  { name: 'Vitamin C Serum 30ml', description: 'Brightening facial serum with 20% Vitamin C and Hyaluronic Acid. Reduces dark spots.', price: 1499, compareAtPrice: 1999, category: 'Health & Beauty', subcategory: 'Skincare', inventory: 55, tags: ['vitamin-c', 'serum', 'skincare'], isFeatured: true },
  { name: 'Shea Body Butter 200ml', description: 'Ultra-moisturizing raw shea butter body cream. Perfect for dry African skin.', price: 650, category: 'Health & Beauty', subcategory: 'Body Care', inventory: 80, tags: ['shea', 'body-butter', 'moisturizer'] },
  { name: 'Argan Hair Oil 100ml', description: 'Pure Moroccan argan oil for hair repair and shine. Anti-frizz formula.', price: 999, category: 'Health & Beauty', subcategory: 'Hair Care', inventory: 40, tags: ['argan', 'hair-oil', 'repair'] },
  { name: 'Natural Charcoal Face Mask', description: 'Deep cleansing charcoal mask that removes impurities and tightens pores.', price: 450, compareAtPrice: 650, category: 'Health & Beauty', subcategory: 'Skincare', inventory: 70, tags: ['charcoal', 'mask', 'face'] },
  { name: 'SPF 50+ Sunscreen 75ml', description: 'Broad spectrum UVA/UVB protection. Lightweight, non-greasy formula.', price: 1200, category: 'Health & Beauty', subcategory: 'Sun Care', inventory: 60, tags: ['sunscreen', 'spf', 'protection'] },
  { name: 'African Black Soap 200g', description: 'Traditional handmade black soap for deep cleansing. Great for acne-prone skin.', price: 350, category: 'Health & Beauty', subcategory: 'Skincare', inventory: 100, tags: ['black-soap', 'african', 'cleansing'] },
  { name: 'Biotin Hair Growth Serum 60ml', description: 'Stimulates hair follicles and reduces hair fall. Enriched with castor oil.', price: 899, compareAtPrice: 1200, category: 'Health & Beauty', subcategory: 'Hair Care', inventory: 45, tags: ['biotin', 'hair-growth', 'serum'] },
  { name: 'Lip Balm Set — 3 Pack', description: 'Moisturizing lip balm with SPF. Flavors: Vanilla, Cherry, and Coconut.', price: 450, category: 'Health & Beauty', subcategory: 'Lip Care', inventory: 90, tags: ['lip-balm', 'spf', 'set'] },

  // Sports & Fitness (vendor6)
  { name: 'Adjustable Dumbbells Set 20kg', description: 'Space-saving adjustable dumbbells. Quick-change dial from 2kg to 20kg each.', price: 12999, compareAtPrice: 15000, category: 'Sports & Fitness', subcategory: 'Weights', inventory: 12, tags: ['dumbbells', 'weights', 'adjustable'], isFeatured: true },
  { name: 'Yoga Mat — Premium 6mm', description: 'Non-slip eco-friendly TPE yoga mat. Comes with carrying strap.', price: 2499, category: 'Sports & Fitness', subcategory: 'Yoga', inventory: 30, tags: ['yoga', 'mat', 'non-slip'] },
  { name: 'Running Shoes — Lightweight', description: 'Breathable mesh running shoes with responsive cushioning. Unisex design.', price: 4999, compareAtPrice: 6500, category: 'Sports & Fitness', subcategory: 'Footwear', inventory: 25, tags: ['running', 'shoes', 'lightweight'] },
  { name: 'Resistance Bands Set of 5', description: '5 resistance levels for full-body workouts. Includes door anchor and carry bag.', price: 1499, category: 'Sports & Fitness', subcategory: 'Accessories', inventory: 50, tags: ['resistance', 'bands', 'workout'] },
  { name: 'Stainless Steel Water Bottle 1L', description: 'Double-wall vacuum insulated. Keeps drinks cold 24hrs or hot 12hrs.', price: 1299, category: 'Sports & Fitness', subcategory: 'Accessories', inventory: 70, tags: ['water-bottle', 'insulated', 'steel'] },
  { name: 'Jump Rope — Speed Cable', description: 'Ball-bearing speed jump rope with adjustable length. Perfect for HIIT.', price: 699, compareAtPrice: 999, category: 'Sports & Fitness', subcategory: 'Cardio', inventory: 60, tags: ['jump-rope', 'speed', 'cardio'] },
  { name: 'Gym Gloves — Full Palm', description: 'Breathable gym gloves with wrist wrap and full palm padding. Anti-slip grip.', price: 999, category: 'Sports & Fitness', subcategory: 'Accessories', inventory: 40, tags: ['gloves', 'gym', 'grip'] },
  { name: 'Foam Roller 45cm', description: 'High-density EVA foam roller for muscle recovery and myofascial release.', price: 1599, category: 'Sports & Fitness', subcategory: 'Recovery', inventory: 35, tags: ['foam-roller', 'recovery', 'massage'] },

  // Books & Media (vendor7)
  { name: 'Wangari Maathai — Unbowed', description: 'Memoir of the Nobel Peace Prize winner and environmental activist. Inspiring read.', price: 899, category: 'Books & Media', subcategory: 'Biography', inventory: 40, tags: ['biography', 'kenya', 'nobel'], isFeatured: true },
  { name: 'Atomic Habits — James Clear', description: 'Tiny changes, remarkable results. Proven framework for building good habits.', price: 1299, compareAtPrice: 1600, category: 'Books & Media', subcategory: 'Self-Help', inventory: 50, tags: ['habits', 'self-help', 'productivity'] },
  { name: 'Rich Dad Poor Dad — Robert Kiyosaki', description: 'Personal finance classic. What the rich teach their kids about money.', price: 999, category: 'Books & Media', subcategory: 'Finance', inventory: 60, tags: ['finance', 'investing', 'classic'] },
  { name: 'The Alchemist — Paulo Coelho', description: 'A magical story about following your dreams. 25th anniversary edition.', price: 750, compareAtPrice: 950, category: 'Books & Media', subcategory: 'Fiction', inventory: 70, tags: ['fiction', 'alchemist', 'classic'] },
  { name: 'Kiswahili-English Dictionary', description: 'Comprehensive bilingual dictionary with 50,000+ entries. Essential for learners.', price: 1500, category: 'Books & Media', subcategory: 'Reference', inventory: 25, tags: ['kiswahili', 'dictionary', 'language'] },
  { name: 'Kenya Primary History Textbook', description: 'CBC-aligned history textbook for Standards 4-8. Illustrated and easy to understand.', price: 650, category: 'Books & Media', subcategory: 'Education', inventory: 80, tags: ['history', 'textbook', 'education'] },
  { name: 'Becoming — Michelle Obama', description: 'Deeply personal memoir by the former First Lady. International bestseller.', price: 1199, compareAtPrice: 1400, category: 'Books & Media', subcategory: 'Biography', inventory: 35, tags: ['biography', 'michelle-obama', 'memoir'] },
  { name: 'Think and Grow Rich — Napoleon Hill', description: 'Timeless wealth-building principles based on interviews with 500+ successful people.', price: 699, category: 'Books & Media', subcategory: 'Finance', inventory: 55, tags: ['wealth', 'success', 'classic'] },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    // Clear existing test data
    console.log('🗑️  Clearing existing test data...');
    await User.deleteMany({ email: { $in: TEST_USERS.map(u => u.email) } });
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});

    // Create users
    console.log('👤 Creating test users...');
    const users = [];
    for (const u of TEST_USERS) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = await User.create({ ...u, password: hashed });
      users.push(user);
      console.log(`  → ${u.name} (${u.email})`);
    }

    const [admin, customer, vendor1, vendor2, vendor3, vendor4, vendor5, vendor6, vendor7] = users;

    // Create products
    console.log('📦 Creating test products...');
    const vendors = [vendor1, vendor2, vendor3, vendor4, vendor5, vendor6, vendor7];
    const products = [];

    for (let i = 0; i < TEST_PRODUCTS.length; i++) {
      const p = TEST_PRODUCTS[i];
      // Assign products evenly: 8 per vendor
      const vendorIndex = Math.floor(i / 8);
      const vendor = vendors[vendorIndex] || vendor1;

      const product = await Product.create({
        ...p,
        vendor: vendor._id,
        images: [TEST_IMAGES[i % TEST_IMAGES.length]],
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        numReviews: Math.floor(Math.random() * 50 + 5),
        totalSales: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 500),
      });
      products.push(product);
      console.log(`  → ${p.name} (by ${vendor.name})`);
    }

    // Create some test reviews
    console.log('⭐ Creating test reviews...');
    for (let i = 0; i < 10; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      await Review.create({
        user: customer._id,
        product: product._id,
        rating: Math.floor(Math.random() * 3 + 3), // 3-5
        title: ['Great product!', 'Worth the price', 'Exceeded expectations', 'Highly recommend', 'Love it!'][Math.floor(Math.random() * 5)],
        comment: 'This product works exactly as described. Quality is excellent and delivery was fast. Would definitely buy again!',
        isVerifiedPurchase: Math.random() > 0.3,
        helpful: [],
        status: 'approved',
      });
    }
    console.log('  → 10 test reviews created.');

    console.log('\n🎉 Seed complete! Here are your test credentials:\n');
    console.log('┌─────────────────────┬───────────────────────────┬───────────────┐');
    console.log('│ Role                │ Email                     │ Password      │');
    console.log('├─────────────────────┼───────────────────────────┼───────────────┤');
    console.log('│ Admin               │ admin@buytopia.co.ke      │ admin123      │');
    console.log('│ Customer            │ customer@test.co.ke       │ customer123   │');
    console.log('│ Vendor (Electronics)│ vendor1@test.co.ke        │ vendor123     │');
    console.log('│ Vendor (Fashion)    │ vendor2@test.co.ke        │ vendor123     │');
    console.log('│ Vendor (Home)       │ vendor3@test.co.ke        │ vendor123     │');
    console.log('│ Vendor (Groceries)  │ vendor4@test.co.ke        │ vendor123     │');
    console.log('│ Vendor (Beauty)     │ vendor5@test.co.ke        │ vendor123     │');
    console.log('│ Vendor (Sports)     │ vendor6@test.co.ke        │ vendor123     │');
    console.log('│ Vendor (Books)      │ vendor7@test.co.ke        │ vendor123     │');
    console.log('└─────────────────────┴───────────────────────────┴───────────────┘');
    console.log(`\n📊 Summary:`);
    console.log(`   Users:     ${users.length}`);
    console.log(`   Products:  ${products.length}`);
    console.log(`   Reviews:   10`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
