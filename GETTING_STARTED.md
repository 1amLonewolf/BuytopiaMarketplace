# Getting Started with Buytopia Marketplace

## Meet.Shop.Thrive

## Quick Start Guide

### Step 1: Install Frontend Dependencies

Open a terminal and run:
```bash
cd marketplace/frontend
npm install
```

This will install all React dependencies (may take a few minutes).

### Step 2: Configure MongoDB

You have two options:

**Option A: Local MongoDB**
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. The default connection string in `.env` will work: `mongodb://localhost:27017/marketplace`

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update the `MONGODB_URI` in `backend/.env`

### Step 3: Configure Stripe (Optional for testing)

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Dashboard
3. Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `backend/.env`

**Note:** You can test without Stripe by using "Cash on Delivery" payment method.

### Step 4: Start the Backend

```bash
cd marketplace/backend
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
MongoDB Connected
```

### Step 5: Start the Frontend

Open a **new terminal** and run:
```bash
cd marketplace/frontend
npm start
```

Your browser should open to `http://localhost:3000`

### Step 6: Create Your First Admin Account

1. Go to http://localhost:3000/register
2. Register with any email/password
3. Choose "Customer" role initially

### Step 7: Make Yourself an Admin (Manual Method)

**Using MongoDB Compass or mongo shell:**

1. Open MongoDB Compass or mongo shell
2. Connect to your database
3. Find the `marketplace` database
4. Go to the `users` collection
5. Find your user document
6. Update the `role` field to `"admin"`

**Using MongoDB Compass:**
- Click on your user document
- Edit the `role` field to `"admin"`
- Click Update

**Using mongo shell:**
```javascript
use marketplace
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

7. Log out and log back in
8. You'll now see "Admin Dashboard" in your menu!

### Step 8: Explore the Platform

**As Admin:**
- Access `/admin/dashboard` for platform analytics
- Approve vendor applications
- Manage users, products, and orders

**As Customer:**
- Browse products
- Add items to cart
- Create orders
- Write reviews

**As Vendor:**
- Register as a vendor or apply to become one
- Add products via `/vendor/dashboard`
- Track sales and orders

## Troubleshooting

### Backend won't start
- Make sure MongoDB is running
- Check that all dependencies are installed: `npm install`
- Verify `.env` file exists with correct values

### Frontend won't start
- Run `npm install` in the frontend directory
- Make sure backend is running on port 5000
- Check for any error messages in the terminal

### CORS errors
- Make sure `CLIENT_URL=http://localhost:3000` is in your `backend/.env`

### Can't connect to MongoDB
- Verify MongoDB is running
- Check your connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

## Default Test Account

After making yourself admin, you can:
1. Create a test vendor account
2. Add some test products
3. Create a customer account
4. Test the full purchase flow

## Next Steps

1. Customize the branding in frontend components
2. Add product images (currently using placeholders)
3. Configure email notifications
4. Set up production deployment
5. Add more payment methods

## Project Location

Your marketplace is located at: `C:\Users\Marsden Maima\Desktop\marketplace`

Enjoy building! 🚀
