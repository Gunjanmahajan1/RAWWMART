// ─────────────────────────────────────────
//  RAWWMART - Product Catalog Seeder
// ─────────────────────────────────────────

const mongoose = require('mongoose');
const User     = require('./models/User');
const Product  = require('./models/Product');

const rawMaterialCatalog = [
  // Vegetables
  {
    name: 'Fresh Red Onions (Kanda)',
    category: 'Vegetables',
    tags: ['onion', 'onions', 'kanda', 'piaz', 'pyaz'],
    price: 140, // ₹140 per 5kg bag
    unit: 'bag',
    packSize: 5,
    packUnit: 'kg',
    stock: 250,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Wholesale Potatoes (Aloo)',
    category: 'Vegetables',
    tags: ['potato', 'potatoes', 'aloo', 'batata'],
    price: 120, // ₹120 per 5kg bag
    unit: 'bag',
    packSize: 5,
    packUnit: 'kg',
    stock: 300,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Ripe Tomatoes (Tamatar)',
    category: 'Vegetables',
    tags: ['tomato', 'tomatoes', 'tamatar'],
    price: 150, // ₹150 per 5kg crate
    unit: 'crate',
    packSize: 5,
    packUnit: 'kg',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Green Capsicum (Shimla Mirch)',
    category: 'Vegetables',
    tags: ['capsicum', 'shimla mirch', 'green pepper'],
    price: 80, // ₹80 per 2kg
    unit: 'bag',
    packSize: 2,
    packUnit: 'kg',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Frozen Green Peas (Matar)',
    category: 'Vegetables',
    tags: ['peas', 'green peas', 'matar'],
    price: 160, // ₹160 per 2kg pack
    unit: 'packet',
    packSize: 2,
    packUnit: 'kg',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Spicy Green Chilies',
    category: 'Vegetables',
    tags: ['chili', 'chilies', 'green chili', 'mirchi'],
    price: 50, // ₹50 per 1kg pack
    unit: 'packet',
    packSize: 1,
    packUnit: 'kg',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Garlic (Lehsun)',
    category: 'Vegetables',
    tags: ['garlic', 'lehsun', 'lasun'],
    price: 120, // ₹120 per 1kg pack
    unit: 'packet',
    packSize: 1,
    packUnit: 'kg',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Ginger (Adrak)',
    category: 'Vegetables',
    tags: ['ginger', 'adrak'],
    price: 80, // ₹80 per 1kg pack
    unit: 'packet',
    packSize: 1,
    packUnit: 'kg',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Coriander (Kothmir / Dhania)',
    category: 'Vegetables',
    tags: ['coriander', 'dhania', 'kothmir', 'cilantro'],
    price: 60, // ₹60 per 1kg bundle
    unit: 'bundle',
    packSize: 1,
    packUnit: 'kg',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1588879460418-24239bc7a61d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Lemons (Nimbu)',
    category: 'Vegetables',
    tags: ['lemon', 'lemons', 'nimbu'],
    price: 90, // ₹90 per 1kg (approx 25 pcs)
    unit: 'bag',
    packSize: 1,
    packUnit: 'kg',
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1534531141161-e4928888126b?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Pudina / Mint Leaves',
    category: 'Vegetables',
    tags: ['mint', 'pudina'],
    price: 45,
    unit: 'bundle',
    packSize: 0.5,
    packUnit: 'kg',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80'
  },

  // Dairy & Bakery
  {
    name: 'Commercial Amul Butter Block',
    category: 'Dairy',
    tags: ['butter', 'makhan', 'amul butter'],
    price: 480, // ₹480 per 1kg block
    unit: 'block',
    packSize: 1,
    packUnit: 'kg',
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Bakery Pav Buns (Pack of 50)',
    category: 'Bakery',
    tags: ['pav', 'pav buns', 'bun', 'ladi pav'],
    price: 150, // ₹150 for 50 pcs (₹3 per pav)
    unit: 'packet',
    packSize: 50,
    packUnit: 'pcs',
    stock: 500,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fresh Curd / Dahi (Bucket)',
    category: 'Dairy',
    tags: ['curd', 'dahi', 'yogurt'],
    price: 180,
    unit: 'bucket',
    packSize: 5,
    packUnit: 'kg',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
  },

  // Grains, Flours & Pulses
  {
    name: 'Chana Dal Besan (Gram Flour)',
    category: 'Grains & Flours',
    tags: ['besan', 'gram flour', 'chana flour'],
    price: 450, // ₹450 per 5kg bag
    unit: 'bag',
    packSize: 5,
    packUnit: 'kg',
    stock: 220,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Refined Maida (All Purpose Flour)',
    category: 'Grains & Flours',
    tags: ['maida', 'flour', 'all purpose flour'],
    price: 210, // ₹210 per 5kg bag
    unit: 'bag',
    packSize: 5,
    packUnit: 'kg',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Kabuli Chana (Chickpeas)',
    category: 'Grains & Flours',
    tags: ['chana', 'kabuli chana', 'chickpeas', 'white chana'],
    price: 550, // ₹550 per 5kg bag
    unit: 'bag',
    packSize: 5,
    packUnit: 'kg',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Thick Poha (Flattened Rice)',
    category: 'Grains & Flours',
    tags: ['poha', 'flattened rice', 'pohe'],
    price: 240, // ₹240 per 5kg bag
    unit: 'bag',
    packSize: 5,
    packUnit: 'kg',
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Dosa Rice (Raw Rice)',
    category: 'Grains & Flours',
    tags: ['dosa rice', 'rice', 'idli rice', 'chawal'],
    price: 420, // ₹420 per 10kg bag
    unit: 'bag',
    packSize: 10,
    packUnit: 'kg',
    stock: 250,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Urad Dal (Skinless Black Gram)',
    category: 'Grains & Flours',
    tags: ['urad dal', 'urad', 'dal'],
    price: 520, // ₹520 per 5kg bag
    unit: 'bag',
    packSize: 5,
    packUnit: 'kg',
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Black Chana (Kala Chana / Boiled Peas)',
    category: 'Grains & Flours',
    tags: ['black chana', 'kala chana'],
    price: 180,
    unit: 'bag',
    packSize: 2,
    packUnit: 'kg',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80'
  },

  // Cooking Oil & Essentials
  {
    name: 'Refined Sunflower Oil (5L Can)',
    category: 'Cooking Oil',
    tags: ['oil', 'cooking oil', 'sunflower oil', 'tel'],
    price: 680, // ₹680 per 5L can
    unit: 'can',
    packSize: 5,
    packUnit: 'litre',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Raw Peanuts (Singdana)',
    category: 'Dry Fruits & Nuts',
    tags: ['peanuts', 'singdana', 'groundnut'],
    price: 220, // ₹220 per 2kg pack
    unit: 'packet',
    packSize: 2,
    packUnit: 'kg',
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1567892560267-08569c528521?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Organic Tamarind (Imli)',
    category: 'Spices',
    tags: ['tamarind', 'imli'],
    price: 120,
    unit: 'packet',
    packSize: 1,
    packUnit: 'kg',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'
  },

  // Pani Puri & Snacks Special
  {
    name: 'Crispy Pani Puri Shells (Pack of 200)',
    category: 'Bakery',
    tags: ['puri', 'puri pack', 'pani puri shells', 'puris'],
    price: 180, // ₹180 for 200 puris
    unit: 'box',
    packSize: 200,
    packUnit: 'pcs',
    stock: 300,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80'
  },

  // Spices & Masala
  {
    name: 'Special Commercial Pav Bhaji Masala',
    category: 'Spices',
    tags: ['pav bhaji masala', 'masala', 'pav bhaji spice'],
    price: 240, // ₹240 per 500g pack
    unit: 'packet',
    packSize: 0.5,
    packUnit: 'kg',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Punjabi Chole Masala Powder',
    category: 'Spices',
    tags: ['chole masala', 'chana masala'],
    price: 220,
    unit: 'packet',
    packSize: 0.5,
    packUnit: 'kg',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Special Pani Puri & Black Salt Masala',
    category: 'Spices',
    tags: ['pani puri masala', 'black salt', 'kala namak'],
    price: 150,
    unit: 'packet',
    packSize: 0.5,
    packUnit: 'kg',
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Authentic Samosa & Garam Masala',
    category: 'Spices',
    tags: ['samosa masala', 'garam masala'],
    price: 210,
    unit: 'packet',
    packSize: 0.5,
    packUnit: 'kg',
    stock: 130,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Iodized Crystal Salt (10kg Bag)',
    category: 'Spices',
    tags: ['salt', 'namak'],
    price: 110,
    unit: 'bag',
    packSize: 10,
    packUnit: 'kg',
    stock: 300,
    imageUrl: 'https://images.unsplash.com/photo-1518110168401-f2841ee59f8a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Red Chili Powder & Turmeric Combo',
    category: 'Spices',
    tags: ['chili powder', 'turmeric', 'haldi', 'lal mirch'],
    price: 260,
    unit: 'packet',
    packSize: 1,
    packUnit: 'kg',
    stock: 170,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
  }
];

async function seedProducts() {
  // Try to find Sharma Traders specifically
  let supplier = await User.findOne({ role: 'supplier', name: { $regex: /sharma/i } });
  
  // If not found, try any supplier
  if (!supplier) {
    supplier = await User.findOne({ role: 'supplier' });
  }
  
  if (!supplier) {
    console.warn('⚠️ No supplier user found for product seeding. Seeding user first...');
    const seedDemoUsers = require('./seed');
    await seedDemoUsers();
    supplier = await User.findOne({ role: 'supplier', name: { $regex: /sharma/i } }) || await User.findOne({ role: 'supplier' });
  }

  if (!supplier) {
    console.error('❌ Failed to get supplier for product seeding.');
    return;
  }

  for (const item of rawMaterialCatalog) {
    await Product.findOneAndUpdate(
      { name: item.name },
      {
        $set: {
          name: item.name,
          category: item.category,
          tags: item.tags,
          price: item.price,
          unit: item.unit,
          packSize: item.packSize,
          packUnit: item.packUnit,
          stock: item.stock,
          supplier: supplier._id,
          imageUrl: item.imageUrl,
          isAvailable: true
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  console.log(`✅ ${rawMaterialCatalog.length} RAWWMART Products seeded successfully for supplier ${supplier.name}!`);
}

if (require.main === module) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rawwmart';
  mongoose.connect(MONGO_URI)
    .then(() => seedProducts())
    .then(() => mongoose.disconnect())
    .catch(err => {
      console.error('❌ Product seed error:', err);
      process.exit(1);
    });
}

module.exports = seedProducts;
