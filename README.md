# RAWWMART

A role-based marketplace for raw material vendors and suppliers.

## Project overview

RAWWMART is a Node.js + Express backend with a static frontend served from `backend/server.js`. It implements core flows for vendors and suppliers:
- Vendor and supplier account registration and login
- JWT-based authentication
- Geospatial supplier search based on vendor location (uses a `2dsphere` index)
- Order placement by vendors and order management by suppliers
- Push notification endpoints for Firebase Cloud Messaging (FCM)

## Repository structure

- `backend/`
   - `server.js` - main Express server
   - `routes/auth.js` - register/login endpoints
   - `routes/orders.js` - order and supplier flow endpoints
   - `routes/notifications.js` - FCM token save and notification send
   - `models/User.js` - vendor/supplier schema
   - `models/Order.js` - order schema
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
    


## What is implemented

- User registration and login with role selection (`vendor` / `supplier`).
- Password hashing with bcrypt.
- JWT token generation and protected routes.
- Supplier search using MongoDB geospatial queries (`location` with `2dsphere` index).
- Order creation, vendor order history, supplier incoming orders.
- Supplier actions: accept, reject, prepare, out for delivery, delivered.
- Notification API endpoints to save FCM tokens and send push messages.
- Static frontend pages for onboarding, login, dashboards, and order interaction.



