// ─────────────────────────────────────────
//  RAWWMART - Main Server File
// ─────────────────────────────────────────

// Always load .env first — before any other require that reads process.env
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const admin    = require('firebase-admin');

const app = express();

// ── Initialize Firebase Admin ──
try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // On Render — read from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local — read from file
    serviceAccount = require('./serviceAccount.json');
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (err) {
  console.log('⚠️ Firebase Admin not initialized:', err.message);
}

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Ensure DB connection for serverless API invocations
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    const uri = process.env.MONGO_URI || (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/rawwmart');
    if (!uri) {
      console.error('❌ MONGO_URI is not configured in environment variables!');
      return res.status(500).json({
        message: 'Server configuration error: MONGO_URI is missing in Vercel Environment Variables. Please add it in Vercel Project Settings.'
      });
    }
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });
      console.log('✅ Connected to MongoDB Atlas on serverless request');
    } catch (err) {
      console.error('❌ MongoDB connection failed on serverless request:', err.message);
      return res.status(500).json({
        message: `Database connection error: ${err.message}. If using MongoDB Atlas, make sure Network Access allows IP 0.0.0.0/0.`
      });
    }
  }
  next();
});

// ── ROUTES ──
const authRoutes         = require('./routes/auth');
const orderRoutes        = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const aiRoutes           = require('./routes/ai');

app.use('/api/auth',          authRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai',            aiRoutes);

app.get('/api/notifications/firebase-config', (req, res) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Firebase client configuration is unavailable' });
  }

  res.set('Cache-Control', 'no-store');
  res.json({ apiKey });
});

// ── HOME ROUTE ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── CONNECT TO DATABASE & START SERVER ──
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rawwmart';

async function startServer() {
  // On Vercel, requests are handled on-demand per invocation via serverless functions.
  // Avoid heavy auto-seeding or listening on ports in serverless containers.
  if (process.env.VERCEL) {
    return;
  }

  try {
    // serverSelectionTimeoutMS: 30s — Atlas SRV needs extra time for DNS + TLS handshake
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    console.log('✅ Connected to MongoDB Atlas database');
  } catch (err) {
    console.warn(`⚠️ Connection to primary MONGO_URI failed (${err.message}). Falling back to local MongoDB...`);
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/rawwmart', { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to local MongoDB database (mongodb://127.0.0.1:27017/rawwmart)');
    } catch (localErr) {
      console.error('❌ Database connection failed:', localErr.message);
      return;
    }
  }

  // Seed demo vendor & supplier users and products
  const seedDemoUsers = require('./seed');
  const seedProducts = require('./seedProducts');
  try {
    await seedDemoUsers();
    await seedProducts();
  } catch (seedErr) {
    console.warn('⚠️ Auto-seeding failed:', seedErr.message);
  }

  // Only listen to port if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 RAWWMART server running at http://localhost:${PORT}`);
    });
  }
}

startServer();

// Export for Vercel
module.exports = app;