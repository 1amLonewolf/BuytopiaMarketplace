# Buytopia Marketplace

A full-featured multi-vendor e-commerce marketplace built with React, Node.js, Express, and MongoDB.

## Tagline: Meet.Shop.Thrive

## Features

### Customer Features
- Browse and search products
- Filter by category, price, rating
- Shopping cart management
- Wishlist functionality
- User registration and authentication
- Order placement and tracking
- Product reviews and ratings
- Vendor storefronts

### Vendor Features
- Vendor application and approval workflow
- Product management (CRUD operations)
- Inventory tracking
- Sales dashboard with analytics
- Order management
- Store customization

### Admin Features
- Platform-wide analytics
- User management
- Vendor approval
- Product moderation
- Order management
- Review moderation

## Tech Stack

**Frontend:**
- React 18
- React Bootstrap
- React Router v6
- Axios
- React Toastify
- Bootstrap 5

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Integration
- Bcrypt for password hashing
- Express Validator

## Project Structure

```
marketplace/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & error handling
│   ├── server.js        # Express server
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # React Context (Auth, Cart)
    │   ├── utils/       # API utilities
    │   ├── App.js       # Main app component
    │   └── index.js     # Entry point
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Stripe account for payments

### Backend Setup

1. Navigate to the backend directory:
```bash
cd marketplace/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update with your credentials
   - Set your MongoDB connection string
   - Add your Stripe API keys
   - Update JWT secret

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd marketplace/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (Vendor/Admin)
- `PUT /api/products/:id` - Update product (Vendor/Admin)
- `DELETE /api/products/:id` - Delete product (Vendor/Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/create-payment-intent` - Create Stripe payment

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark review as helpful

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/:productId` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `GET /api/vendors/:id/products` - Get vendor's products
- `GET /api/vendors/dashboard/stats` - Vendor dashboard stats
- `POST /api/vendors/apply` - Apply to become vendor

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/vendors/pending` - Get pending vendors
- `PUT /api/admin/vendors/:id/approve` - Approve vendor
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `PUT /api/admin/products/:id/featured` - Toggle featured
- `GET /api/admin/reviews` - Get all reviews

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

## User Roles

1. **Customer** - Browse, purchase, review products
2. **Vendor** - All customer features + manage products and orders
3. **Admin** - Full platform access and management

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
CLIENT_URL=http://localhost:3000
```

## Features in Detail

### Shopping Cart
- Add/remove products
- Update quantities
- Persistent cart (stored in database for logged-in users, localStorage for guests)
- Real-time price calculation
- Free shipping on orders over $50

### Payment Integration
- Stripe payment processing
- Secure payment intents
- Order status tracking
- Refund support (admin)

### Search & Filters
- Full-text search
- Category filtering
- Price range filtering
- Rating filtering
- Sorting options (price, date, rating)

### Reviews System
- 5-star rating system
- Verified purchase badges
- Helpful review voting
- Review moderation tools

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- Secure HTTP headers

## Future Enhancements

- Image upload support (AWS S3, Cloudinary)
- Email notifications (order confirmations, status updates)
- Advanced analytics dashboard
- Coupon/discount system
- Multi-currency support
- Mobile app
- Real-time chat between customers and vendors
- Product recommendations
- Advanced search with Elasticsearch

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.
