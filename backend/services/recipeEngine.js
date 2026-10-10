// ─────────────────────────────────────────
//  RAWWMART - Recipe & Recommendation Engine
// ─────────────────────────────────────────

const Product = require('../models/Product');

/**
 * Standard structured recipes for supported dishes.
 * Quantities are PER SERVING / PER PLATE.
 */
const RECIPES = {
  'pav bhaji': {
    name: 'Pav Bhaji',
    category: 'Fast Food',
    defaultWastage: 0.08, // 8% wastage buffer
    ingredients: [
      { name: 'Potatoes', tags: ['potato', 'potatoes', 'aloo', 'batata'], perServing: 120, unit: 'g' },
      { name: 'Tomatoes', tags: ['tomato', 'tomatoes', 'tamatar'], perServing: 80, unit: 'g' },
      { name: 'Onions', tags: ['onion', 'onions', 'kanda', 'piaz', 'pyaz'], perServing: 60, unit: 'g' },
      { name: 'Butter', tags: ['butter', 'makhan', 'amul butter'], perServing: 25, unit: 'g' },
      { name: 'Pav Buns', tags: ['pav', 'pav buns', 'bun', 'ladi pav'], perServing: 2, unit: 'pcs' },
      { name: 'Capsicum', tags: ['capsicum', 'shimla mirch', 'green pepper'], perServing: 30, unit: 'g' },
      { name: 'Green Peas', tags: ['peas', 'green peas', 'matar'], perServing: 30, unit: 'g' },
      { name: 'Cooking Oil', tags: ['oil', 'cooking oil', 'sunflower oil', 'tel'], perServing: 10, unit: 'ml' },
      { name: 'Pav Bhaji Masala', tags: ['pav bhaji masala', 'masala'], perServing: 5, unit: 'g' },
      { name: 'Garlic', tags: ['garlic', 'lehsun', 'lasun'], perServing: 8, unit: 'g' },
      { name: 'Ginger', tags: ['ginger', 'adrak'], perServing: 5, unit: 'g' },
      { name: 'Coriander', tags: ['coriander', 'dhania', 'kothmir'], perServing: 5, unit: 'g' },
      { name: 'Lemons', tags: ['lemon', 'lemons', 'nimbu'], perServing: 0.5, unit: 'pcs' }
    ]
  },
  'vada pav': {
    name: 'Vada Pav',
    category: 'Fast Food',
    defaultWastage: 0.07,
    ingredients: [
      { name: 'Potatoes', tags: ['potato', 'potatoes', 'aloo', 'batata'], perServing: 100, unit: 'g' },
      { name: 'Pav Buns', tags: ['pav', 'pav buns', 'bun', 'ladi pav'], perServing: 1, unit: 'pcs' },
      { name: 'Besan (Gram Flour)', tags: ['besan', 'gram flour', 'chana flour'], perServing: 30, unit: 'g' },
      { name: 'Cooking Oil', tags: ['oil', 'cooking oil', 'sunflower oil', 'tel'], perServing: 25, unit: 'ml' },
      { name: 'Green Chilies', tags: ['chili', 'chilies', 'green chili', 'mirchi'], perServing: 8, unit: 'g' },
      { name: 'Garlic', tags: ['garlic', 'lehsun', 'lasun'], perServing: 10, unit: 'g' },
      { name: 'Spices & Salt', tags: ['garam masala', 'salt', 'turmeric'], perServing: 5, unit: 'g' }
    ]
  },
  'pani puri': {
    name: 'Pani Puri',
    category: 'Street Food',
    defaultWastage: 0.05,
    ingredients: [
      { name: 'Puri Shells', tags: ['puri', 'puri pack', 'pani puri shells', 'puris'], perServing: 6, unit: 'pcs' },
      { name: 'Potatoes', tags: ['potato', 'potatoes', 'aloo', 'batata'], perServing: 40, unit: 'g' },
      { name: 'Black Chana / Peas', tags: ['black chana', 'kala chana'], perServing: 20, unit: 'g' },
      { name: 'Pudina / Mint', tags: ['mint', 'pudina'], perServing: 15, unit: 'g' },
      { name: 'Coriander', tags: ['coriander', 'dhania', 'kothmir'], perServing: 15, unit: 'g' },
      { name: 'Green Chilies', tags: ['chili', 'chilies', 'green chili', 'mirchi'], perServing: 5, unit: 'g' },
      { name: 'Tamarind (Imli)', tags: ['tamarind', 'imli'], perServing: 15, unit: 'g' },
      { name: 'Pani Puri Masala', tags: ['pani puri masala', 'black salt'], perServing: 5, unit: 'g' }
    ]
  },
  'samosa': {
    name: 'Samosa',
    category: 'Snacks',
    defaultWastage: 0.07,
    ingredients: [
      { name: 'Potatoes', tags: ['potato', 'potatoes', 'aloo', 'batata'], perServing: 80, unit: 'g' },
      { name: 'Refined Maida', tags: ['maida', 'flour', 'all purpose flour'], perServing: 40, unit: 'g' },
      { name: 'Green Peas', tags: ['peas', 'green peas', 'matar'], perServing: 20, unit: 'g' },
      { name: 'Cooking Oil', tags: ['oil', 'cooking oil', 'sunflower oil', 'tel'], perServing: 30, unit: 'ml' },
      { name: 'Samosa Masala', tags: ['samosa masala', 'garam masala'], perServing: 5, unit: 'g' },
      { name: 'Green Chilies & Ginger', tags: ['chili', 'chilies', 'ginger'], perServing: 6, unit: 'g' }
    ]
  },
  'dosa': {
    name: 'Dosa',
    category: 'South Indian',
    defaultWastage: 0.06,
    ingredients: [
      { name: 'Dosa Rice', tags: ['dosa rice', 'rice', 'idli rice', 'chawal'], perServing: 80, unit: 'g' },
      { name: 'Urad Dal', tags: ['urad dal', 'urad', 'dal'], perServing: 25, unit: 'g' },
      { name: 'Potatoes', tags: ['potato', 'potatoes', 'aloo', 'batata'], perServing: 60, unit: 'g' },
      { name: 'Onions', tags: ['onion', 'onions', 'kanda', 'piaz', 'pyaz'], perServing: 30, unit: 'g' },
      { name: 'Cooking Oil', tags: ['oil', 'cooking oil', 'sunflower oil', 'tel'], perServing: 15, unit: 'ml' },
      { name: 'Spices & Salt', tags: ['salt', 'namak', 'turmeric'], perServing: 4, unit: 'g' }
    ]
  },
  'poha': {
    name: 'Poha',
    category: 'Breakfast',
    defaultWastage: 0.05,
    ingredients: [
      { name: 'Thick Poha', tags: ['poha', 'flattened rice', 'pohe'], perServing: 70, unit: 'g' },
      { name: 'Onions', tags: ['onion', 'onions', 'kanda', 'piaz', 'pyaz'], perServing: 40, unit: 'g' },
      { name: 'Potatoes', tags: ['potato', 'potatoes', 'aloo', 'batata'], perServing: 30, unit: 'g' },
      { name: 'Cooking Oil', tags: ['oil', 'cooking oil', 'sunflower oil', 'tel'], perServing: 15, unit: 'ml' },
      { name: 'Peanuts (Singdana)', tags: ['peanuts', 'singdana', 'groundnut'], perServing: 15, unit: 'g' },
      { name: 'Green Chilies & Spices', tags: ['chili', 'chilies', 'turmeric'], perServing: 5, unit: 'g' },
      { name: 'Coriander & Lemon', tags: ['coriander', 'dhania', 'lemon'], perServing: 5, unit: 'g' }
    ]
  },
  'chole bhature': {
    name: 'Chole Bhature',
    category: 'North Indian',
    defaultWastage: 0.08,
    ingredients: [
      { name: 'Kabuli Chana', tags: ['chana', 'kabuli chana', 'chickpeas', 'white chana'], perServing: 80, unit: 'g' },
      { name: 'Refined Maida', tags: ['maida', 'flour', 'all purpose flour'], perServing: 70, unit: 'g' },
      { name: 'Onions', tags: ['onion', 'onions', 'kanda', 'piaz', 'pyaz'], perServing: 50, unit: 'g' },
      { name: 'Tomatoes', tags: ['tomato', 'tomatoes', 'tamatar'], perServing: 40, unit: 'g' },
      { name: 'Cooking Oil', tags: ['oil', 'cooking oil', 'sunflower oil', 'tel'], perServing: 35, unit: 'ml' },
      { name: 'Curd / Dahi', tags: ['curd', 'dahi', 'yogurt'], perServing: 15, unit: 'g' },
      { name: 'Chole Masala', tags: ['chole masala', 'chana masala'], perServing: 8, unit: 'g' },
      { name: 'Ginger & Garlic', tags: ['ginger', 'garlic', 'lehsun', 'adrak'], perServing: 8, unit: 'g' }
    ]
  }
};

/**
 * Standardize dish name key
 */
function normalizeDishName(input) {
  if (!input) return null;
  const str = input.toLowerCase().trim();
  for (const key of Object.keys(RECIPES)) {
    if (str.includes(key) || key.includes(str)) {
      return key;
    }
  }
  if (str.includes('pav') && str.includes('bhaji')) return 'pav bhaji';
  if (str.includes('vada') || str.includes('wada')) return 'vada pav';
  if (str.includes('puri') || str.includes('panipuri')) return 'pani puri';
  if (str.includes('samosa')) return 'samosa';
  if (str.includes('dosa') || str.includes('dhosa')) return 'dosa';
  if (str.includes('poha') || str.includes('pohe')) return 'poha';
  if (str.includes('chole') || str.includes('bhature')) return 'chole bhature';
  return null;
}

/**
 * Unit conversion helper
 * Converts quantity in recipe unit (g, ml, pcs) to target product unit (kg, L, pcs)
 */
function convertUnit(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity;
  if (fromUnit === 'g' && (toUnit === 'kg' || toUnit === 'bag' || toUnit === 'crate' || toUnit === 'packet' || toUnit === 'block')) {
    return quantity / 1000;
  }
  if (fromUnit === 'ml' && (toUnit === 'litre' || toUnit === 'L' || toUnit === 'can')) {
    return quantity / 1000;
  }
  if (fromUnit === 'pcs' && (toUnit === 'kg' || toUnit === 'bag' || toUnit === 'crate')) {
    return quantity / 25; // approx 25 lemons / produce items per kg
  }
  if (fromUnit === 'pcs' && (toUnit === 'pcs' || toUnit === 'packet' || toUnit === 'box')) {
    return quantity;
  }
  return quantity;
}

/**
 * Minimum serving threshold for commercial wholesale bulk raw material calculations.
 */
const MIN_SERVINGS = 10;

/**
 * Calculate raw materials and match with real DB products
 */
async function calculateRecommendations({ dishName, servings, budget = null, wastagePercent = null }) {
  const normalizedKey = normalizeDishName(dishName);
  if (!normalizedKey || !RECIPES[normalizedKey]) {
    return {
      error: true,
      message: `Dish "${dishName}" is not directly in standard recipe catalog. Supported dishes: Pav Bhaji, Vada Pav, Pani Puri, Samosa, Dosa, Poha, Chole Bhature.`
    };
  }

  const recipe = RECIPES[normalizedKey];
  const requestedServings = Math.max(1, parseInt(servings) || MIN_SERVINGS);
  const isBelowMinServings = requestedServings < MIN_SERVINGS;
  const numServings = isBelowMinServings ? MIN_SERVINGS : requestedServings;

  const wastage = wastagePercent !== null && wastagePercent !== undefined 
    ? parseFloat(wastagePercent) 
    : recipe.defaultWastage;

  const allDbProducts = await Product.find({ isAvailable: true }).populate('supplier', 'name deliveryAddress location');

  const items = [];
  let totalEstimatedCost = 0;

  for (const ing of recipe.ingredients) {
    const rawRequired = ing.perServing * numServings;
    const withWastage = rawRequired * (1 + wastage);

    // Find best matching product from DB
    let matchedProduct = null;
    for (const tag of ing.tags) {
      matchedProduct = allDbProducts.find(prod => 
        prod.tags.some(pt => pt.toLowerCase() === tag.toLowerCase()) ||
        prod.name.toLowerCase().split(/\s+/).includes(tag.toLowerCase())
      );
      if (matchedProduct) break;
    }

    if (!matchedProduct) {
      // Fallback: substring match on product name
      for (const tag of ing.tags) {
        matchedProduct = allDbProducts.find(p => p.name.toLowerCase().includes(tag.toLowerCase()));
        if (matchedProduct) break;
      }
    }

    let requiredInProductUnits = 0;
    let roundedPacks = 1;
    let itemPricePerPack = 0;
    let itemTotalCost = 0;
    let packSize = 1;
    let packUnit = ing.unit;
    let productName = ing.name;
    let productId = null;
    let imageUrl = '';
    let supplierId = null;
    let supplierName = 'RAWWMART Verified Supplier';

    if (matchedProduct) {
      productId = matchedProduct._id;
      productName = matchedProduct.name;
      packSize = matchedProduct.packSize || 1;
      packUnit = matchedProduct.packUnit || matchedProduct.unit || 'kg';
      itemPricePerPack = matchedProduct.price;
      imageUrl = matchedProduct.imageUrl || '';
      if (matchedProduct.supplier) {
        supplierId = matchedProduct.supplier._id;
        supplierName = matchedProduct.supplier.name;
      }

      // Convert recipe raw required to product's pack unit
      requiredInProductUnits = convertUnit(withWastage, ing.unit, packUnit);

      // Pack-size rounding: round UP to next full commercial pack
      roundedPacks = Math.ceil(requiredInProductUnits / packSize);
      if (roundedPacks < 1) roundedPacks = 1;

      itemTotalCost = roundedPacks * itemPricePerPack;
    } else {
      // Unmatched estimate fallback
      requiredInProductUnits = convertUnit(withWastage, ing.unit, 'kg');
      roundedPacks = Math.ceil(requiredInProductUnits);
      itemPricePerPack = 100;
      itemTotalCost = roundedPacks * itemPricePerPack;
    }

    totalEstimatedCost += itemTotalCost;

    items.push({
      ingredientName: ing.name,
      recipePerServing: ing.perServing,
      recipeUnit: ing.unit,
      rawRequired: Math.round(rawRequired * 100) / 100,
      withWastage: Math.round(withWastage * 100) / 100,
      wastagePercent: Math.round(wastage * 100),
      productId,
      productName,
      packSize,
      packUnit,
      packsToOrder: roundedPacks,
      totalPurchasedQuantity: roundedPacks * packSize,
      pricePerPack: itemPricePerPack,
      itemTotalCost,
      imageUrl,
      supplierId,
      supplierName,
      isAvailable: matchedProduct ? matchedProduct.isAvailable : true
    });
  }

  // Budget comparison & optimization status
  let budgetStatus = 'unknown';
  let budgetDifference = 0;
  let budgetMessage = '';
  let budgetTier = 'Standard Recommendation';

  if (budget && parseFloat(budget) > 0) {
    const targetBudget = parseFloat(budget);
    budgetDifference = targetBudget - totalEstimatedCost;
    if (totalEstimatedCost <= targetBudget) {
      budgetStatus = 'under_budget';
      budgetMessage = `Within budget! Saved ₹${Math.abs(budgetDifference).toLocaleString('en-IN')}`;
    } else {
      budgetStatus = 'over_budget';
      budgetMessage = `Exceeds target budget by ₹${Math.abs(budgetDifference).toLocaleString('en-IN')}`;
      budgetTier = 'Budget Exceeded (Adjust pack sizes or servings if needed)';
    }
  }

  return {
    error: false,
    dish: recipe.name,
    dishKey: normalizedKey,
    servings: numServings,
    requestedServings,
    isBelowMinServings,
    minServings: MIN_SERVINGS,
    minServingsNotice: isBelowMinServings 
      ? `Requested ${requestedServings} serving(s) is below our minimum wholesale threshold of ${MIN_SERVINGS} servings. RAWWMART bulk packs (5kg, 25kg, etc.) are optimized for commercial bulk orders.` 
      : null,
    wastagePercent: Math.round(wastage * 100),
    totalEstimatedCost,
    targetBudget: budget ? parseFloat(budget) : null,
    budgetStatus,
    budgetDifference,
    budgetMessage,
    budgetTier,
    items,
    calculatedAt: new Date()
  };
}

module.exports = {
  RECIPES,
  MIN_SERVINGS,
  normalizeDishName,
  calculateRecommendations
};
