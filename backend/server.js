// ─────────────────────────────────────────
//  RAWWMART - Main Server File
// ─────────────────────────────────────────

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const admin    = require('firebase-admin');

// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
app.use(express.static(path.join(__dirname, '../frontend')));

// ── ROUTES ──
const authRoutes         = require('./routes/auth');
const orderRoutes        = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth',          authRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/notifications', notificationRoutes);

// ── HOME ROUTE ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── CONNECT TO DATABASE & START SERVER ──
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rawwmart';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB database');
    app.listen(PORT, () => {
      console.log(`🚀 RAWWMART server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });