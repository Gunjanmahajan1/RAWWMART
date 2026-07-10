// ─────────────────────────────────────────
//  RAWWMART - Orders Routes
// ─────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const admin   = require('firebase-admin');
const User    = require('../models/User');
const Order   = require('../models/Order');

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

// ── Helper: send push notification ──
async function sendPushNotification(fcmToken, title, body, link) {
  try {
    if (!fcmToken) return;
    await admin.messaging().send({
      notification: { title, body },
      token: fcmToken,
      webpush: {
        notification: { title, body, icon: 'https://rawwmart.vercel.app/icon-192.png', vibrate: [200,100,200] },
        fcmOptions: { link: link || 'https://rawwmart.vercel.app' }
      }
    });
    console.log('Push notification sent to:', fcmToken.substring(0,20)+'...');
  } catch (err) {
    console.log('Push notification failed:', err.message);
  }
}

// ── GET nearby suppliers ──
router.get('/nearby-suppliers', protect, async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query;

    const suppliers = await User.find({
      role: 'supplier',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('name mobile email deliveryAddress location gstVerified');

    res.json({ suppliers });
  } catch (err) {
    console.error('Nearby suppliers error:', err.message);
    res.status(500).json({ message: 'Could not find nearby suppliers.' });
  }
});

// ── POST place order ──
router.post('/place', protect, async (req, res) => {
  try {
    const { supplierId, items, deliveryAddress, notes } = req.body;

    const supplier = await User.findById(supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    const vendor = await User.findById(req.userId);

    const order = await Order.create({
      vendor:          req.userId,
      supplier:        supplierId,
      items,
      deliveryAddress,
      notes: notes || ''
    });

    // ── Send push notification to supplier ──
    if (supplier.fcmToken) {
      const itemList = items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
      await sendPushNotification(
        supplier.fcmToken,
        '🛒 New Order Received!',
        `${vendor.name} ordered: ${itemList}`,
        'https://rawwmart.vercel.app/supplier-dashboard.html'
      );
    }

    res.status(201).json({ message: 'Order placed successfully!', order });

  } catch (err) {
    console.error('Place order error:', err.message);
    res.status(500).json({ message: 'Could not place order.' });
  }
});

// ── GET vendor's orders ──
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.userId })
      .populate('supplier', 'name mobile email')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch orders.' });
  }
});

// ── GET supplier's incoming orders ──
router.get('/incoming', protect, async (req, res) => {
  try {
    const orders = await Order.find({ supplier: req.userId })
      .populate('vendor', 'name mobile email deliveryAddress')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch incoming orders.' });
  }
});

// ── PUT accept order ──
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('vendor', 'name fcmToken');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status     = 'accepted';
    order.acceptedAt = new Date();
    await order.save();

    // Notify vendor
    if (order.vendor.fcmToken) {
      await sendPushNotification(
        order.vendor.fcmToken,
        '✅ Order Accepted!',
        'Your order has been accepted by the supplier and is being prepared.',
        'https://rawwmart.vercel.app/vendor-dashboard.html'
      );
    }

    res.json({ message: 'Order accepted!', order });
  } catch (err) {
    res.status(500).json({ message: 'Could not accept order.' });
  }
});

// ── PUT reject order ──
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('vendor', 'name fcmToken');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status = 'rejected';
    await order.save();

    // Notify vendor
    if (order.vendor.fcmToken) {
      await sendPushNotification(
        order.vendor.fcmToken,
        '❌ Order Rejected',
        'Your order was rejected by the supplier. Please try another supplier.',
        'https://rawwmart.vercel.app/vendor-dashboard.html'
      );
    }

    res.json({ message: 'Order rejected.', order });
  } catch (err) {
    res.status(500).json({ message: 'Could not reject order.' });
  }
});

// ── PUT update status ──
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['preparing', 'out_for_delivery', 'delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id).populate('vendor', 'name fcmToken');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    // Notify vendor based on status
    const messages = {
      preparing:        { title: '🔧 Order Being Prepared', body: 'Your order is being prepared by the supplier.' },
      out_for_delivery: { title: '🚚 Order Out for Delivery!', body: 'Your order is on its way to your stall!' },
      delivered:        { title: '✅ Order Delivered!', body: 'Your order has been delivered successfully.' }
    };

    if (order.vendor.fcmToken && messages[status]) {
      await sendPushNotification(
        order.vendor.fcmToken,
        messages[status].title,
        messages[status].body,
        'https://rawwmart.vercel.app/vendor-dashboard.html'
      );
    }

    res.json({ message: `Order marked as ${status}`, order });
  } catch (err) {
    res.status(500).json({ message: 'Could not update status.' });
  }
});

module.exports = router;