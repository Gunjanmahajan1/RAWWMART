// ─────────────────────────────────────────
//  RAWWMART - Notifications Route
// ─────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const admin   = require('firebase-admin');
const User    = require('../models/User');

// ── Middleware: check login ──
function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not logged in.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rawwmart_secret_key');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

// ── Save FCM token ──
// POST /api/notifications/save-token
router.post('/save-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'FCM token required.' });
    await User.findByIdAndUpdate(req.userId, { fcmToken });
    console.log('FCM token saved for user:', req.userId);
    res.json({ message: 'FCM token saved.' });
  } catch (err) {
    console.log('Save token error:', err.message);
    res.status(500).json({ message: 'Could not save token.' });
  }
});

// ── Send notification to a specific user ──
// POST /api/notifications/send
router.post('/send', protect, async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser || !targetUser.fcmToken) {
      return res.status(404).json({ message: 'User FCM token not found.' });
    }

    const message = {
      notification: { title, body },
      token: targetUser.fcmToken,
      webpush: {
        notification: {
          title,
          body,
          icon: 'https://rawwmart.vercel.app/icon-192.png',
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: 'https://rawwmart.vercel.app/supplier-dashboard.html'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    res.json({ message: 'Notification sent!', response });

  } catch (err) {
    console.log('Send notification error:', err.message);
    res.status(500).json({ message: 'Could not send notification.' });
  }
});

module.exports = router;