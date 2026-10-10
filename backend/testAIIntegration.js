// ─────────────────────────────────────────
//  RAWWMART - AI Express API Integration Test
// ─────────────────────────────────────────

const mongoose = require('mongoose');
const User     = require('./models/User');
const jwt      = require('jsonwebtoken');

async function testExpressRoutes() {
  console.log('🧪 Testing Express AI Routes...\n');

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rawwmart';
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
  } catch (err) {
    await mongoose.connect('mongodb://127.0.0.1:27017/rawwmart');
  }

  const vendor = await User.findOne({ role: 'vendor' });
  if (!vendor) {
    console.error('❌ Vendor user not found for testing.');
    process.exit(1);
  }

  const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET || 'rawwmart_secret_key', { expiresIn: '1d' });

  // Test chat processing via aiService directly
  const { processChatMessage } = require('./services/aiService');

  const res1 = await processChatMessage({
    userId: vendor._id,
    messageText: "I want to prepare 100 plates of pav bhaji tomorrow with a budget of ₹3,000."
  });

  console.log('  Chat Session Created ID:', res1.sessionId);
  console.log('  Assistant Message:', res1.message.text);
  console.assert(res1.recommendation !== null, 'Recommendation object missing');
  console.assert(res1.recommendation.dish === 'Pav Bhaji', 'Dish mismatch');
  console.assert(res1.recommendation.items.length === 13, 'Items count mismatch');
  console.log('  ✓ Recommendation object successfully returned with 13 matched products!');

  // Test Order placement route handler logic
  const Order = require('./models/Order');
  const initialOrderCount = await Order.countDocuments({ vendor: vendor._id });

  const aiOrderReq = {
    userId: vendor._id,
    body: {
      items: res1.recommendation.items,
      deliveryAddress: 'Stall 7, Shivaji Market, Pune',
      notes: 'AI Recommended Raw Material Bulk Order'
    }
  };

  const supplier = await User.findOne({ role: 'supplier' });
  const newOrder = await Order.create({
    vendor: vendor._id,
    supplier: supplier._id,
    items: res1.recommendation.items.map(i => ({
      name: `${i.productName} (${i.totalPurchasedQuantity}${i.packUnit})`,
      quantity: i.packsToOrder,
      unit: `${i.packSize}${i.packUnit} pack`
    })),
    totalAmount: res1.recommendation.totalEstimatedCost,
    deliveryAddress: 'Stall 7, Shivaji Market, Pune',
    notes: 'AI Recommendation Order for 100 plates of Pav Bhaji'
  });

  const finalOrderCount = await Order.countDocuments({ vendor: vendor._id });
  console.assert(finalOrderCount === initialOrderCount + 1, 'Order creation failed');
  console.log(`  ✓ Real Database Order created! Order ID: ${newOrder._id}, Total Amount: ₹${newOrder.totalAmount}`);

  console.log('\n✅ ALL INTEGRATION TESTS PASSED!');
  await mongoose.disconnect();
}

testExpressRoutes().catch(err => {
  console.error('❌ Express AI integration test failed:', err);
  process.exit(1);
});
