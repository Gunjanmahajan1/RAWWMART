# RAWWMART

A role-based marketplace for raw material vendors and suppliers.

## Project overview

RAWWMART is a Node.js + Express backend with a static frontend served from `backend/server.js`. It implements core flows for vendors and suppliers:
- Vendor and supplier account registration and login
- JWT-based authentication
- Geospatial supplier search based on vendor location (uses a `2dsphere` index)
- Order placement by vendors and order management by suppliers
- Push notification endpoints for Firebase Cloud Messaging (FCM)

## What's new

- **AI Smart Kitchen Assistant**: Interactive conversational assistant in the vendor dashboard to assist vendors with raw material estimation and order planning.
- **Recipe & Recommendation Engine**: Calculates raw material requirements based on dish type (e.g., Pav Bhaji, Vada Pav, Pani Puri) and target servings, incorporating realistic wastage buffers and commercial pack sizes.
- **Live Supplier Catalog Matching**: Matches recipe ingredient requirements with active supplier inventory and current market pricing.
- **One-Click Order Placement**: Vendors can review AI recommendation breakdowns and dispatch orders directly to suppliers in a single click.
- **Product Catalog & Automated Seeding**: Added `Product` schema and automated seeder (`seedProducts.js`) populating realistic raw materials across categories (vegetables, dairy, staples, bakery, packaging).
- **Vercel Serverless Optimization**: Added serverless function entry point (`api/index.js`), auto-reconnecting MongoDB middleware for serverless API invocations, and updated `vercel.json` routing configuration.

## Repository structure

- `api/`
   - `index.js` - Vercel serverless function entry point
- `backend/`
   - `server.js` - main Express server
   - `routes/auth.js` - register/login endpoints
   - `routes/orders.js` - order and supplier flow endpoints
   - `routes/notifications.js` - FCM token save and notification send
   - `routes/ai.js` - AI chat, recipe recommendation, and ordering endpoints
   - `services/aiService.js` - natural language intent parsing and recommendation service
   - `services/recipeEngine.js` - recipe definitions and serving/ingredient calculation engine
   - `models/User.js` - vendor/supplier schema
   - `models/Order.js` - order schema
   - `models/Product.js` - supplier product catalog schema
   - `models/AIChatSession.js` - AI chat session history schema
   - `seed.js` - demo vendor and supplier account seeder
   - `seedProducts.js` - raw material and product catalog seeder
- `frontend/`
   - `index.html` - landing page
   - `page2.html` - role selection page
   - `vendor-login.html` / `supplier-login.html` - login/register forms
   - `vendor-dashboard.html` / `supplier-dashboard.html` - dashboards
   - `notifications.js` - Firebase messaging helper
   - `firebase-messaging-sw.js` - service worker for browser notifications
- `package.json` - dependency list

## Setup (local development)

1. Install dependencies:
    ```bash
    npm install
    ```

2. Create a `.env` file in the project root with at least:
    ```env
    PORT=
    MONGO_URI=
    NODE_ENV=
    JWT_SECRET=
    ```

3. Start the server:
    ```bash
    node backend/server.js
    ```

4. Open the app in a browser:
    http://localhost:5000

## What is implemented

- User registration and login with role selection (`vendor` / `supplier`).
- Password hashing with bcrypt.
- JWT token generation and protected routes.
- Supplier search using MongoDB geospatial queries (`location` with `2dsphere` index).
- Order creation, vendor order history, supplier incoming orders.
- Supplier actions: accept, reject, prepare, out for delivery, delivered.
- Notification API endpoints to save FCM tokens and send push messages.
- Static frontend pages for onboarding, login, dashboards, and order interaction.
- AI Smart Kitchen Assistant with conversational chat interface and session history.
- Dynamic recipe-to-ingredient calculation with wastage allowances and pack sizing.
- Instant 1-click order placement from AI recommendations.
- Product catalog schema and automatic demo data seeding.

## Deployment

### Full-Stack Deployment (Vercel)

The entire application (backend + frontend) is deployed on Vercel. Configuration is in `vercel.json`.

**Required Environment Variables on Vercel:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `FIREBASE_API_KEY` - Firebase client API key
- `FIREBASE_SERVICE_ACCOUNT` - Firebase admin service account JSON


**Architecture:**
- Backend API routes: `/api/*` → handled by Node.js serverless functions
- Frontend static files: `/*` → served from `frontend/` directory
- Both backend and frontend deployed on the same Vercel domain

