// ─────────────────────────────────────────
//  RAWWMART - AI Routes
// ─────────────────────────────────────────

const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const { processChatMessage } = require('../services/aiService');
const AIChatSession          = require('../models/AIChatSession');
const Order                  = require('../models/Order');
const User                   = require('../models/User');
const Product                = require('../models/Product');

// ── Middleware: Protect routes ──
function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not logged in.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rawwmart_secret_key');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ── POST /api/ai/chat ──
router.post('/chat', protect, async (req, res) => {
  try {
    const { sessionId, prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'Please provide a valid prompt.' });
    }

    const result = await processChatMessage({
      userId: req.userId,
      sessionId,
      messageText: prompt
    });

    res.json(result);
  } catch (err) {
    console.error('AI Chat Error:', err.message);
    res.status(500).json({ message: err.message || 'Error processing AI recommendation prompt.' });
  }
});

// ── GET /api/ai/history ──
router.get('/history', protect, async (req, res) => {
  try {
    const sessions = await AIChatSession.find({ user: req.userId })
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch AI chat history.' });
  }
});

// ── GET /api/ai/session/:id ──
router.get('/session/:id', protect, async (req, res) => {
  try {
    const session = await AIChatSession.findOne({ _id: req.params.id, user: req.userId });
    if (!session) return res.status(404).json({ message: 'Chat session not found.' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving session.' });
  }
});

// ── POST /api/ai/order-recommendation ──
router.post('/order-recommendation', protect, async (req, res) => {
  try {
    const { supplierId, items, deliveryAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items specified in recommendation.' });
    }

    if (!deliveryAddress || typeof deliveryAddress !== 'string' || !deliveryAddress.trim()) {
      return res.status(400).json({ message: 'Delivery address is required.' });
    }

    // Find supplier — try the specified one first, then Sharma Traders by name, then any active supplier
    let supplier = null;
    if (supplierId) {
      supplier = await User.findById(supplierId).catch(() => null);
    }
    if (!supplier || supplier.role !== 'supplier') {
      // Try to find Sharma Traders specifically
      supplier = await User.findOne({ role: 'supplier', name: { $regex: /sharma/i } });
    }
    if (!supplier || supplier.role !== 'supplier') {
      // Fallback to any supplier
      supplier = await User.findOne({ role: 'supplier' });
    }
    if (!supplier) {
      return res.status(404).json({ message: 'No active supplier found in the system. Please contact support.' });
    }

    // Server-side validation of items, prices, quantities
    const validatedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const qty   = Math.max(1, parseInt(item.packsToOrder || item.quantity) || 1);
      const unit  = String(item.packUnit || item.unit || 'kg');
      const name  = String(item.productName || item.name || item.ingredientName || 'Raw Material');
      
      let price = parseFloat(item.pricePerPack || item.price || 0) || 0;
      if (item.productId) {
        try {
          const prod = await Product.findById(item.productId);
          if (prod) {
            price = prod.price;
            if (prod.stock < qty) {
              console.warn(`⚠️ Limited stock for ${prod.name}: ${prod.stock} available, ${qty} requested`);
            }
          }
        } catch (lookupErr) {
          console.warn(`⚠️ Could not look up product ${item.productId}:`, lookupErr.message);
        }
      }
      if (!price || price <= 0) price = 100; // safe fallback price

      const itemTotal = qty * price;
      calculatedTotal += itemTotal;

      const purchasedQty = item.totalPurchasedQuantity || (qty * (parseFloat(item.packSize) || 1));
      validatedItems.push({
        name:     `${name} (${purchasedQty} ${unit})`,
        quantity: qty,
        unit:     unit
      });
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({ message: 'No valid items could be processed from the recommendation.' });
    }

    // Prevent duplicate orders within 60 seconds
    const oneMinAgo = new Date(Date.now() - 60000);
    const existingRecent = await Order.findOne({
      vendor: req.userId,
      supplier: supplier._id,
      createdAt: { $gte: oneMinAgo },
      totalAmount: calculatedTotal
    });

    if (existingRecent) {
      return res.status(400).json({
        message: 'A duplicate order with identical items was recently placed. Please check your order history.',
        order: existingRecent
      });
    }

    // Create real DB Order
    const order = await Order.create({
      vendor:          req.userId,
      supplier:        supplier._id,
      items:           validatedItems,
      totalAmount:     calculatedTotal,
      deliveryAddress: deliveryAddress.trim(),
      notes:           notes ? notes.trim() : 'AI Recommended Raw Material Bulk Order',
      status:          'pending'
    });

    // Notify supplier via push notification if available
    try {
      if (supplier.fcmToken) {
        const vendor = await User.findById(req.userId);
        const itemSummary = validatedItems.slice(0, 3).map(i => i.name).join(', ');
        const { sendPushNotification } = require('./orders'); // reuse if exported, otherwise skip
        console.log(`📦 AI Order placed by ${vendor?.name || req.userId} → Supplier: ${supplier.name}`);
      }
    } catch (notifyErr) {
      console.warn('Push notification skipped:', notifyErr.message);
    }

    res.status(201).json({
      message: 'Order created successfully from AI recommendation!',
      order
    });

  } catch (err) {
    console.error('❌ Order recommendation creation error:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to place order from recommendation.' });
  }
});

module.exports = router;
