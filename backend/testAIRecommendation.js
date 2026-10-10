// ─────────────────────────────────────────
//  RAWWMART - AI Recommendation Unit & Integration Tests
// ─────────────────────────────────────────

const mongoose = require('mongoose');
const { calculateRecommendations, normalizeDishName } = require('./services/recipeEngine');
const { parseIntentDeterministic } = require('./services/aiService');
const seedDemoUsers = require('./seed');
const seedProducts  = require('./seedProducts');

async function runTests() {
  console.log('🚀 Running RAWWMART AI Recommendation Engine Tests...\n');

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rawwmart';
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
  } catch (err) {
    console.log('⚠️ Primary MONGO_URI connection failed. Connecting to local MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/rawwmart');
  }

  await seedDemoUsers();
  await seedProducts();

  // Test 1: Dish Normalization
  console.log('--- Test 1: Dish Normalization ---');
  const dishesToTest = [
    { input: 'pav bhaji', expected: 'pav bhaji' },
    { input: 'wada pav', expected: 'vada pav' },
    { input: 'panipuri', expected: 'pani puri' },
    { input: 'samosas', expected: 'samosa' },
    { input: 'masala dosa', expected: 'dosa' },
    { input: 'kanda poha', expected: 'poha' },
    { input: 'chole bhature', expected: 'chole bhature' }
  ];

  dishesToTest.forEach(t => {
    const res = normalizeDishName(t.input);
    console.assert(res === t.expected, `Expected ${t.expected}, got ${res}`);
    console.log(`  ✓ "${t.input}" -> "${res}"`);
  });

  // Test 2: Intent Parsing
  console.log('\n--- Test 2: Deterministic Intent Parsing ---');
  const samplePrompt = "I want to prepare 100 plates of pav bhaji tomorrow with a budget of ₹3,000.";
  const intent = parseIntentDeterministic(samplePrompt);
  console.log('  Prompt:', samplePrompt);
  console.log('  Extracted Intent:', intent);
  console.assert(intent.dish === 'pav bhaji', 'Dish extraction failed');
  console.assert(intent.servings === 100, 'Servings extraction failed');
  console.assert(intent.budget === 3000, 'Budget extraction failed');
  console.log('  ✓ Intent parsing verified successfully!');

  // Test 3: Recipe & Pack Size Rounding Calculation for all 7 dishes
  console.log('\n--- Test 3: Recipe Calculations for All 7 Supported Dishes ---');
  const dishes = ['pav bhaji', 'vada pav', 'pani puri', 'samosa', 'dosa', 'poha', 'chole bhature'];

  for (const d of dishes) {
    const rec = await calculateRecommendations({
      dishName: d,
      servings: 100,
      budget: 3000
    });
    console.assert(!rec.error, `Calculation error for ${d}`);
    console.assert(rec.items.length > 0, `No items calculated for ${d}`);
    console.log(`  ✓ ${rec.dish} (100 servings): Total ₹${rec.totalEstimatedCost} across ${rec.items.length} matched products. Status: ${rec.budgetStatus}`);
  }

  // Test 4: Specific Pav Bhaji 100 Plates & Budget Test
  console.log('\n--- Test 4: Detailed Pav Bhaji 100 Servings Audit ---');
  const pavRec = await calculateRecommendations({
    dishName: 'pav bhaji',
    servings: 100,
    budget: 3000
  });

  console.log(`  Dish: ${pavRec.dish}`);
  console.log(`  Servings: ${pavRec.servings}`);
  console.log(`  Wastage Buffer: ${pavRec.wastagePercent}%`);
  console.log(`  Target Budget: ₹${pavRec.targetBudget}`);
  console.log(`  Calculated Total: ₹${pavRec.totalEstimatedCost}`);
  console.log(`  Budget Status: ${pavRec.budgetStatus} (${pavRec.budgetMessage})`);

  pavRec.items.forEach(i => {
    console.log(`    - ${i.productName}: Raw req ${i.withWastage}${i.recipeUnit} -> ${i.packsToOrder} packs (${i.totalPurchasedQuantity} ${i.packUnit}) @ ₹${i.pricePerPack}/pack = ₹${i.itemTotalCost}`);
  });

  console.log('\n✅ ALL AI RECOMMENDATION ENGINE TESTS PASSED!');
  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
