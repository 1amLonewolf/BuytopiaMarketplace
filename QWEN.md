# Buytopia Marketplace — Project Context

> **Last updated:** April 13, 2026

## Project Overview

**Buytopia** is a **multi-vendor e-commerce marketplace** built on the **MERN stack** (MongoDB, Express, React, Node.js). The platform enables multiple independent vendors to sell products through a shared storefront, with comprehensive support for shopping carts, wishlists, order management, product reviews/ratings, vendor dashboards, admin oversight, and Stripe payment processing.

The project is split into two independently runnable packages:

| Package | Path | Purpose |
|---------|------|---------|
| **Backend** | `backend/` | Express 5 REST API + Mongoose ODM |
| **Frontend** | `frontend/` | React 18 SPA (Vite + React Bootstrap) |

---

## Tech Stack

### Backend
- **Node.js** + **Express 5**
- **MongoDB** via **Mongoose 9**
- **JWT** authentication (`jsonwebtoken`)
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **Stripe** for payment processing (`stripe` v22)
- **Cloudinary** for image uploads (`cloudinary`)
- **multer** for multipart file uploads
- **nodemon** for hot-reload during development
- **cors** for cross-origin configuration

### Frontend
- **React 18** with **Vite 5** (`"type": "module"` in package.json)
- **React Router v6** for client-side routing
- **React Bootstrap 2** + **Bootstrap 5** for UI components
- **Axios** for HTTP requests
- **React Toastify** for notifications (3s auto-close, top-right)
- **React Icons** for iconography
- **React Router Bootstrap** integration

---

## Directory Structure

```
marketplace/
├── README.md                    # Project documentation
├── GETTING_STARTED.md           # Step-by-step setup guide
├── background.jpg               # Background image asset
├── Buytopia.png                 # Buytopia branding
├── Buytopia_Logo.png            # Buytopia logo
├── MarketplaceLogo.jpg          # Marketplace branding
├── shopper-template-*.jpg.jpg   # Shopper template asset
├── inspiration.txt              # Project inspiration notes
├── start-fullstack.bat          # Quick-start script (opens backend + frontend)
├── QWEN.md                      # This file — project context
│
├── backend/
│   ├── server.js                # Express entry point
│   ├── package.json             # Backend dependencies & scripts
│   ├── .env                     # Environment variables
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js              # User + vendor profile schema
│   │   ├── Product.js           # Product catalog schema
│   │   ├── Order.js             # Order schema
│   │   ├── Cart.js              # Cart schema
│   │   └── Review.js            # Review/rating schema
│   ├── routes/                  # REST API route handlers
│   │   ├── auth.js              # Register, login, password
│   │   ├── users.js             # User profile CRUD
│   │   ├── products.js          # Product catalog CRUD
│   │   ├── cart.js              # Cart operations
│   │   ├── orders.js            # Order + payment
│   │   ├── reviews.js           # Reviews + helpful voting
│   │   ├── wishlist.js          # Wishlist operations
│   │   ├── vendors.js           # Vendor management
│   │   └── admin.js             # Admin-only operations
│   └── middleware/
│       ├── auth.js              # JWT protect, authorize, optionalAuth
│       ├── upload.js            # Multer config for file uploads
│       └── errorHandler.js      # Centralized error handling (UNUSED — see Known Issues)
│
└── frontend/
    ├── index.html               # HTML entry point
    ├── package.json             # Frontend dependencies & scripts
    └── src/
        ├── index.jsx            # Vite entry point
        ├── index.css            # Global styles (CSS custom properties, animations)
        ├── App.jsx              # Router configuration + route guards
        ├── components/          # React page/view components
        │   ├── Navbar.jsx               # Sticky navbar, responsive hamburger
        │   ├── Footer.jsx               # Footer with newsletter, social, contact
        │   ├── Home.jsx                 # Landing page with featured products, stats
        │   ├── Products.jsx             # Product listing with search, filters, sort, pagination
        │   ├── ProductCard.jsx          # Reusable product card component
        │   ├── ProductDetail.jsx        # Single product view with reviews
        │   ├── Cart.jsx                 # Shopping cart (guest + authenticated)
        │   ├── Checkout.jsx             # Checkout with Stripe + COD
        │   ├── Login.jsx                # Login form
        │   ├── Register.jsx             # Registration form
        │   ├── Profile.jsx              # User profile management
        │   ├── Orders.jsx               # Order history
        │   ├── Wishlist.jsx             # Wishlist management
        │   ├── PrivateRoute.jsx         # Route guard for auth + role checks
        │   ├── VendorDashboard.jsx      # Vendor dashboard (BUG — see Known Issues)
        │   ├── VendorStore.jsx          # Public vendor storefront
        │   ├── AdminDashboard.jsx       # Admin platform overview
        │   ├── AdminUsers.jsx           # Admin user management
        │   ├── AdminProducts.jsx        # Admin product management
        │   ├── AdminOrders.jsx          # Admin order management
        │   ├── AdminVendors.jsx         # Admin vendor approval + management
        │   └── AdminReviews.jsx         # Admin review moderation
        ├── context/             # React Context state management
        │   ├── AuthContext.jsx  # Authentication state + guest-to-DB cart merge on login
        │   └── CartContext.jsx  # Cart state (dual-mode: localStorage + DB)
        └── utils/
            └── api.jsx          # Axios setup with base URL + token injection
```

---

## Data Models

### User (`User.js`)
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique, validated |
| `password` | String | Required (min 6), `select: false`, hashed via bcrypt pre-save hook |
| `role` | Enum | `customer` (default), `vendor`, `admin` |
| `avatar` | String | Profile image URL |
| `phone` | String | |
| `address` | Object | `street`, `city`, `state`, `zipCode`, `country` |
| `isActive` | Boolean | Default `true` |
| `vendorProfile` | Object | `storeName`, `storeDescription`, `storeLogo`, `storeBanner`, `isApproved`, `rating`, `totalSales` |
| `wishlist` | ObjectId[] | References `Product` |

**Pre-save hook:** Auto-hashes password.
**Instance method:** `comparePassword(candidatePassword)`.

### Product (`Product.js`)
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `description` | String | Required |
| `price` | Number | Required, min 0 |
| `compareAtPrice` | Number | Original price (for showing discounts) |
| `images` | String[] | Array of image URLs |
| `category` | String | Required, indexed |
| `subcategory` | String | |
| `vendor` | ObjectId | Required, references `User`, indexed with `status` |
| `inventory` | Number | Required, min 0 |
| `sku` | String | Unique, sparse |
| `status` | Enum | `draft`, `active` (default), `archived` |
| `rating` | Number | 0–5, default 0 |
| `numReviews` | Number | Default 0 |
| `tags` | String[] | |
| `weight`, `dimensions` | Number/Object | Shipping metadata |
| `isFeatured` | Boolean | Default `false` |
| `totalSales`, `views` | Number | Analytics counters |

**Indexes:** Text search (`name` + `description`), compound (`category` + `status`), compound (`vendor` + `status`), `price`, `rating` (desc), `createdAt` (desc).

### Order (`Order.js`)
| Field | Type | Notes |
|-------|------|-------|
| `orderNumber` | String | Auto-generated unique string via pre-save hook |
| `user` | ObjectId | References `User` |
| `items[]` | Array | Sub-documents: `product` (ref), `name`, `price`, `quantity`, `image`, `vendor` (ref) |
| `shippingAddress` | Object | Required embedded: `street`, `city`, `state`, `zipCode`, `country`, `phone` |
| `paymentMethod` | String | e.g., `"Stripe"`, `"Cash on Delivery"` |
| `paymentResult` | Object | Stripe metadata: `id`, `status`, `email_address` |
| `itemsPrice`, `taxPrice`, `shippingPrice`, `totalPrice` | Number | Calculated totals |
| `status` | Enum | `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `isPaid`, `paidAt` | Boolean / Date | Payment tracking |
| `isDelivered`, `deliveredAt` | Boolean / Date | Delivery tracking |
| `trackingNumber` | String | |
| `notes` | String | Optional admin/vendor notes |

### Cart (`Cart.js`)
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | References `User`, **unique** (one cart per user) |
| `items[]` | Array | Sub-documents: `productId` (**String** ⚠️), `name`, `price`, `quantity`, `image`, `vendor` (ref) |

**Virtuals:** `totalItems` (sum of quantities), `totalPrice` (sum of price × quantity).

> ⚠️ **Known issue:** `productId` is stored as `String` instead of `mongoose.Schema.Types.ObjectId`, which breaks Mongoose population and referential integrity.

### Review (`Review.js`)
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | References `User` |
| `product` | ObjectId | References `Product` |
| `order` | ObjectId | Optional, references `Order` for verified purchase badge |
| `rating` | Number | Required, 1–5 |
| `title` | String | |
| `comment` | String | |
| `isVerifiedPurchase` | Boolean | Set when user has a completed order for the product |
| `helpful[]` | ObjectId[] | User IDs who voted helpful |
| `images[]` | String[] | |
| `status` | Enum | `pending`, `approved` (default), `rejected` |

**Unique compound index:** `{user, product}` — prevents duplicate reviews per user per product.

### Key Relationships
```
User 1:N  Product   (via vendor field)
User 1:N  Order
User 1:1  Cart      (unique constraint)
User N:M  Product   (via wishlist array)
Product 1:N Review
Product 1:N Order   (via items array, denormalized snapshot)
Order 1:N  Review   (via order reference)
```

---

## Authentication & Authorization

### JWT Flow
1. User registers/logs in → backend returns JWT token (expires in 30 days)
2. Token stored in `localStorage` (frontend) and attached as `Authorization: Bearer <token>` header via Axios interceptor
3. `protect` middleware (`backend/middleware/auth.js`) verifies token, checks `isActive`, attaches `req.user` (password excluded via `select: false`)
4. `authorize(...roles)` middleware checks user role — **admins bypass all role checks** (superuser pattern)
5. `optionalAuth` silently verifies token if present but doesn't block if absent (used on public endpoints like product listing)

### Role-Based Access

| Role | Access |
|------|--------|
| **Customer** | Browse, cart, wishlist, orders, reviews, profile management |
| **Vendor** | All customer access + product CRUD (own products), order management, sales dashboard |
| **Admin** | Full platform access — user/vendor/product/order/review management, vendor approval, featured product toggling |

### Frontend Route Protection
The `PrivateRoute` component:
- Shows loading spinner while `AuthContext` is loading
- Redirects to `/login` if not authenticated
- If `role` prop is set, checks `user.role === role || user.role === 'admin'` (admins can access all protected routes)

---

## API Endpoints

All prefixed under `/api`.

### `/auth` — Authentication
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/register` | Public | Create user, return JWT. Validates name, email, password, optional role. |
| POST | `/auth/login` | Public | Authenticate via email/password, checks `isActive`, returns JWT + user data. |
| GET | `/auth/me` | Protected | Return current authenticated user. |
| PUT | `/auth/password` | Protected | Update password after verifying current password. |

### `/users` — User Profiles
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/users/profile` | Protected | Return authenticated user's full profile. |
| PUT | `/users/profile` | Protected | Update allowed fields: `name`, `phone`, `avatar`, `address`, `vendorProfile`. |
| GET | `/users/:id` | Public | Public user lookup (strips password). |

### `/products` — Product Catalog
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/products` | Public + optionalAuth | Filterable listing: `category`, `vendor`, `search` (text), `minPrice`/`maxPrice`, `minRating`, `sort`, `page`, `limit`. |
| GET | `/products/featured` | Public | Return active featured products (limit 8). |
| GET | `/products/categories` | Public | Return distinct category names for active products. |
| GET | `/products/:id` | Public | Return product by ID with vendor populated. Increments `views` counter. |
| POST | `/products` | Vendor/Admin | Create product. Validates name, description, price, inventory, category. Auto-sets `vendor` to current user. |
| PUT | `/products/:id` | Vendor/Admin | Update product. Vendors can only update own products (ownership check). |
| DELETE | `/products/:id` | Vendor/Admin | Delete product. Vendors can only delete own products. |

### `/cart` — Shopping Cart (all protected)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/cart` | Protected | Return user's cart (creates empty one if none exists). |
| POST | `/cart/add` | Protected | Add item to cart or increment quantity if exists. |
| PUT | `/cart/:productId` | Protected | Update quantity; removes item if quantity < 1. |
| DELETE | `/cart/:productId` | Protected | Remove item from cart. |
| DELETE | `/cart` | Protected | Clear all cart items. |

### `/orders` — Orders & Payments
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/orders` | Protected | Create order. Validates items, checks inventory, calculates tax (10%), shipping (free over $50 or $10), deducts inventory, increments `totalSales` on products. |
| GET | `/orders` | Protected | Return authenticated user's orders. |
| GET | `/orders/admin` | Admin | All orders with pagination, status filter. |
| GET | `/orders/:id` | Protected (owner/admin/vendor) | Order by ID. Authorization: owner, admin, or vendor whose products are in the order. |
| PUT | `/orders/:id/pay` | Owner only | Mark order as paid. Records `paymentResult`. |
| PUT | `/orders/:id/status` | Vendor/Admin | Update order status. On "delivered", updates vendor `totalSales`. |
| POST | `/orders/:id/refund` | Admin | Refund via Stripe. Restores inventory. |
| POST | `/orders/create-payment-intent` | Protected | Create Stripe PaymentIntent. |

### `/reviews` — Reviews & Ratings
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/reviews/product/:productId` | Public + optionalAuth | Return approved reviews for a product with helpful vote count. |
| POST | `/reviews` | Protected | Create review. Checks for duplicate, verifies purchase via orderId, updates product rating. |
| PUT | `/reviews/:id` | Owner only | Update review. Recalculates product rating. |
| DELETE | `/reviews/:id` | Owner or Admin | Delete review. Recalculates product rating. |
| POST | `/reviews/:id/helpful` | Protected | Mark review as helpful (one vote per user). |
| PUT | `/reviews/:id/approve` | Admin only | Approve review (change status to `approved`). |

### `/wishlist` — Wishlist (all protected)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/wishlist` | Protected | Return user's wishlist with product and vendor populated. |
| POST | `/wishlist/:productId` | Protected | Add product to wishlist. |
| DELETE | `/wishlist/:productId` | Protected | Remove product from wishlist. |

### `/vendors` — Vendor Management
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/vendors` | Public | Return all approved vendors, sorted by rating. |
| GET | `/vendors/:id` | Public | Return vendor by ID (strips password). |
| GET | `/vendors/:id/products` | Public | Return vendor's active products. |
| GET | `/vendors/dashboard/stats` | Vendor only | Dashboard stats: totalProducts, activeProducts, totalOrders, totalSales, totalRevenue, recentOrders. |
| POST | `/vendors/apply` | Protected | Apply to become vendor. Sets role to `vendor`, `isApproved: false`. |

### `/admin` — Admin Operations (all admin-only)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Platform stats: users, vendors, customers, products, orders, revenue (via aggregation), recent orders, pending vendors. |
| GET | `/admin/users` | Paginated user list. |
| PUT | `/admin/users/:id` | Update user. ⚠️ No field restriction — can overwrite any field including `password`. |
| DELETE | `/admin/users/:id` | Delete user. |
| GET | `/admin/vendors/pending` | Pending vendor applications. |
| PUT | `/admin/vendors/:id/approve` | Approve vendor application. |
| GET | `/admin/orders` | Paginated orders with population. |
| GET | `/admin/products` | Paginated products with vendor population. |
| PUT | `/admin/products/:id/featured` | Toggle featured status. |
| GET | `/admin/reviews` | Paginated reviews with user + product population. |

---

## Frontend Routes

| Path | Component | Access | Notes |
|------|-----------|--------|-------|
| `/` | Home | Public | Hero section, featured products, stats |
| `/products` | Products | Public | Search, filters, sorting, pagination |
| `/products/:id` | ProductDetail | Public | Product info, reviews, add to cart |
| `/vendor/:id` | VendorStore | Public | Public vendor storefront |
| `/cart` | Cart | Public | Guest + authenticated cart |
| `/checkout` | Checkout | Authenticated | Stripe PaymentIntent + Cash on Delivery ⚠️ |
| `/login` | Login | Public | Login form |
| `/register` | Register | Public | Registration form |
| `/profile` | Profile | Authenticated | User profile management |
| `/orders` | Orders | Authenticated | Order history |
| `/wishlist` | Wishlist | Authenticated | Wishlist management |
| `/vendor/dashboard` | VendorDashboard | Vendor | ⚠️ BUG: Fetches ALL products, not vendor's own |
| `/admin/dashboard` | AdminDashboard | Admin | Platform overview + stats |
| `/admin/users` | AdminUsers | Admin | User management |
| `/admin/products` | AdminProducts | Admin | Product management ⚠️ Status filter doesn't hit backend |
| `/admin/orders` | AdminOrders | Admin | Order management |
| `/admin/vendors` | AdminVendors | Admin | Vendor approval + management |
| `/admin/reviews` | AdminReviews | Admin | Review moderation |

**Non-existent routes referenced in Footer:** `/vendors`, `/about`, `/contact`, `/faq`, `/account`, `/returns`, `/shipping`, `/privacy`, `/terms`, `/cookies` — these are NOT defined in the React router.

---

## State Management

### React Context (Dual Pattern)

**`AuthContext`** (`frontend/src/context/AuthContext.jsx`)
- Manages: `user`, `token`, `loading`
- On mount: If token in `localStorage`, sets Axios Authorization header and fetches `/api/auth/me`
- `login(credentials)`: POSTs credentials → merges guest cart (localStorage) into DB cart → saves token → updates state
- `register(data)`: POSTs user data → saves token → updates state
- `logout()`: Clears token, localStorage cart, Axios header, resets state
- Convenience booleans: `isAuthenticated`, `isAdmin`, `isVendor`
- ⚠️ **Cart merge race condition:** Multiple sequential `axios.post('/api/cart/add')` calls fire without `Promise.all()` — may cause inconsistent cart state.

**`CartContext`** (`frontend/src/context/CartContext.jsx`)
- Dual-mode: DB-backed for authenticated users, localStorage-backed for guests
- Auto-syncs on login (guest cart merged to DB)
- Provides: `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`
- `cartItems` array derived from either API response or localStorage

### Component-Level State
All other state (products, filters, pagination, modals, forms) managed with local `useState`/`useEffect` hooks. No global store (Redux, Zustand, etc.).

### API Utility (`frontend/src/utils/api.jsx`)
```js
// Sets axios base URL to process.env.REACT_APP_API_URL || 'http://localhost:5000'
// ⚠️ Uses Create-React-App env var syntax — should be import.meta.env.VITE_API_URL for Vite
// Injects Authorization header from localStorage token on init
```

---

## Building & Running

### Quick Start (Windows)

Double-click **`start-fullstack.bat`** in the project root. It will:
1. Open a "Buytopia Backend" window (nodemon on port 5000)
2. Open a "Buytopia Frontend" window (Vite on port 3000)

> **Note:** MongoDB must be started manually before running the script. If using Windows services: `net start MongoDB` (requires admin).

### Prerequisites
- **Node.js** v14+
- **MongoDB** (local or MongoDB Atlas)
- **Stripe account** (optional — Cash on Delivery works for testing)

### Backend

```bash
cd backend
npm install
npm run dev          # Development with nodemon (port 5000)
npm start            # Production with node
```

### Frontend

```bash
cd frontend
npm install
npm start            # Vite dev server (port 3000)
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

### Environment Variables (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/marketplace

# JWT Secret
JWT_SECRET=supersecretmarketplacejwtkey2026changeinproduction
JWT_EXPIRE=30d

# Stripe (Replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Frontend URL
CLIENT_URL=http://localhost:3000

# Cloudinary (Image Upload & Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> 🔒 **Security note:** The current `JWT_SECRET` and Stripe keys are placeholders. Replace before any production use.

---

## Development Conventions

- **Backend:** Async/await pattern throughout. Centralized error handling exists in `middleware/errorHandler.js` but is **not used** — `server.js` defines an inline error handler instead (dead code). JWT auth via `middleware/auth.js` with `protect`, `authorize`, and `optionalAuth` helpers. Mongoose pre-save hooks for password hashing and order number generation.
- **Frontend:** Functional components with React hooks. State managed via React Context (`AuthContext`, `CartContext`). Routes protected by `PrivateRoute` component. Bootstrap 5 class names for styling. CSS custom properties for theming. Animations: `fadeIn`, `slideIn`, `scaleIn`, `pulse`, `shimmer`. Skeleton loading states for Products and ProductCard.
- **API Communication:** Axios for HTTP requests. JWT token attached as Bearer header (injected via `utils/api.jsx` and `AuthContext`). Errors surfaced as React Toastify notifications.
- **Static Files:** Uploads served from `backend/uploads` directory via Express static middleware (but no upload routes exist yet).

---

## Key Features

| Feature | Details |
|---------|---------|
| **Shopping Cart** | Persistent (DB for logged-in users, localStorage for guests), auto-merge on login, real-time pricing, free shipping over KSh 50 |
| **Wishlist** | Per-user product wishlist with vendor population |
| **Reviews** | 5-star ratings, verified purchase badges, helpful voting, admin moderation/approval, duplicate prevention |
| **Search & Filters** | Full-text search, category/price/rating filtering, multi-field sorting, pagination |
| **Payments** | Stripe Checkout redirect, order status tracking, Cash on Delivery fallback, M-Pesa option, admin-initiated refunds with inventory restoration |
| **Vendor Workflow** | Application → admin approval → dashboard access → product management → order fulfillment → sales analytics (per-vendor data isolation) |
| **Admin Dashboard** | Platform analytics (UTC time-series aggregation pipelines), user/vendor/product/order/review management, vendor approval queue, featured product toggling |
| **Vendor Storefront** | Public-facing vendor page with vendor info, rating, and product listing |
| **Guest Checkout** | Cash on Delivery available without payment provider |
| **Scroll-to-Top** | Automatic page scroll on every route change via `ScrollToTop` component |
| **Test Data Seeding** | `backend/scripts/seed.js` — 56 products, 7 vendors, 9 users with Picsum images |

---

## Known Issues & Technical Debt

### Critical
1. **No test suite** — Both packages have placeholder test scripts. No unit, integration, or E2E tests.
2. **Stripe keys are test-mode** — Functional but not production-ready. Need `sk_live_` / `pk_live_` keys.
3. **JWT_SECRET is a development placeholder** — `supersecretmarketplacejwtkey2026changeinproduction`. Must be changed before production.
4. **No production Stripe webhook** — Requires `stripe listen` CLI locally. Production needs Stripe Dashboard webhook endpoint.

### Moderate
5. **Checkout polls for order before clearing cart** — Works as fallback but could still fail if webhook is delayed > 10s.
6. **Review rating calculation is inefficient** — Re-queries ALL reviews for the product to recalculate average. Should use MongoDB aggregation or running totals.
7. **Currency inconsistency** — Some components use KES, others may fall back to USD. Verify all price formatters use `en-KE` / `KES`.

### Minor / Housekeeping
8. **`errorHandler.js` is dead code** — Not used in `server.js`.
9. **No email notifications** — SMTP configured but no credentials provided. Need `SMTP_USER` and `SMTP_PASS` in `.env`.
10. **No coupon/discount system** — No promo codes or site-wide sales.
11. **No ESLint / Prettier configuration** — No code quality tooling configured.
12. **No CI/CD pipeline** — No automated testing, linting, or deployment workflows.

---

## Useful Commands

```bash
# Quick start (Windows)
# Double-click start-fullstack.bat in the project root

# Start Stripe CLI webhook forwarder
# Double-click start-stripe.bat (opens new window)
# Copy the whsec_... secret it outputs → paste into backend/.env STRIPE_WEBHOOK_SECRET

# Start MongoDB manually (requires admin in Command Prompt)
net start MongoDB

# Seed test data (56 products, 7 vendors, 9 users)
cd backend && node scripts/seed.js

# Make a user an admin via MongoDB shell
use marketplace
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } })

# Check API health
curl http://localhost:5000/api/health

# Install dependencies for both
cd backend && npm install && cd ../frontend && npm install

# View MongoDB data (mongosh)
use marketplace
db.users.find().pretty()
db.products.find().pretty()
db.orders.find().pretty()
```

---

## File Index

| File | Purpose |
|------|---------|
| `start-fullstack.bat` | Quick-start script — opens backend + frontend in separate windows |
| `start-stripe.bat` | Stripe CLI webhook forwarder — forwards to localhost:5000/api/webhooks/stripe |
| `backend/scripts/seed.js` | Test data seeder — 56 products, 7 vendors, 9 users with Picsum images |
| `backend/server.js` | Express app setup, middleware, DB connection, route mounting, inline error handler |
| `backend/.env` | Environment configuration (ports, secrets, URLs, SMTP, SSL) |
| `backend/middleware/auth.js` | JWT `protect`, `authorize(...)`, `optionalAuth` middleware |
| `backend/middleware/upload.js` | Multer config for image uploads (5 images max, 2 MB each) |
| `backend/middleware/errorHandler.js` | Centralized error handling (**unused — dead code**) |
| `backend/models/User.js` | User schema with bcrypt hashing, vendor profile, address, wishlist |
| `backend/models/Product.js` | Product schema with indexes, text search, analytics counters |
| `backend/models/Order.js` | Order schema with payment, shipping, status tracking, order number generation |
| `backend/models/Cart.js` | Cart schema with unique user constraint, virtuals for totals ⚠️ `productId` is String |
| `backend/models/Review.js` | Review schema with verified purchase, helpful votes, unique user+product constraint |
| `frontend/src/App.jsx` | Top-level routing, context providers, navbar/footer/toast layout |
| `frontend/src/context/AuthContext.jsx` | Auth state (user, login, logout, register), guest-to-DB cart merge on login |
| `frontend/src/context/CartContext.jsx` | Cart state (add, update, remove, clear), dual-mode (localStorage + DB) |
| `frontend/src/components/PrivateRoute.jsx` | Route guard for authenticated/role-protected routes |
| `frontend/src/utils/api.jsx` | Axios setup with base URL and token injection ⚠️ wrong env var syntax |

---

## Suggested Next Steps (Prioritized)

### Phase 1 — Bug Fixes & Cleanup
- Fix VendorDashboard to fetch only vendor's own products (`?vendor=${user._id}`)
- Change Cart schema `productId` from `String` to `mongoose.Schema.Types.ObjectId`
- Fix `utils/api.jsx` to use `import.meta.env.VITE_API_URL`
- Remove dead `errorHandler.js` or wire it up properly
- Fix currency inconsistency (pick one: KES or USD)

### Phase 2 — Testing & Quality
- Add ESLint + Prettier configuration
- Write unit tests for models and middleware
- Write integration tests for API endpoints
- Add E2E tests for critical user flows (browse → cart → checkout → order)

### Phase 3 — Feature Completion
- ~~Implement image upload~~ — **Done**: Cloudinary integration with vendor upload UI
- Add Stripe Elements checkout form for real payment processing
- Implement email notifications (SendGrid / Nodemailer)
- Add coupon/discount system
- Build out missing pages (About, Contact, FAQ, etc.) or remove Footer links

### Phase 4 — Production Readiness
- Rotate all secrets (JWT_SECRET, Stripe keys)
- Add rate limiting and helmet security middleware
- Set up CI/CD pipeline (GitHub Actions / Vercel / Railway)
- Configure production MongoDB (Atlas or managed instance)
- Add logging and error tracking (Sentry / Winston)
