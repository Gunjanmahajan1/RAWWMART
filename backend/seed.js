// ─────────────────────────────────────────
//  RAWWMART - Demo Users Seeder
// ─────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rawwmart';

const demoUsers = [
  {
    name: 'Demo Vendor',
    mobile: '9876543210',
    email: 'vendor@demo.com',
    password: 'password123',
    role: 'vendor',
    permanentAddress: '123 MG Road, Pune, Maharashtra 411001',
    deliveryAddress: 'Stall 7, Shivaji Market, Pune 411001',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204] // Pune coordinates
    },
    gstNumber: '',
    gstVerified: false
  },
  {
    name: 'Sharma Traders (Demo Supplier)',
    mobile: '9988776655',
    email: 'supplier@demo.com',
    password: 'password123',
    role: 'supplier',
    permanentAddress: '45 MIDC Industrial Area, Pune 411026',
    deliveryAddress: 'Warehouse B3, MIDC Bhosari, Pune 411026',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204] // Pune coordinates
    },
    gstNumber: '27AAPFU0939F1ZV',
    gstVerified: true
  }
];

async function seedDemoUsers() {
  let connectedHere = false;
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    } catch (err) {
      await mongoose.connect('mongodb://127.0.0.1:27017/rawwmart');
    }
    connectedHere = true;
  }

  for (const u of demoUsers) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(u.password, salt);

    await User.findOneAndUpdate(
      { email: u.email },
      {
        $set: {
          name: u.name,
          mobile: u.mobile,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          permanentAddress: u.permanentAddress,
          deliveryAddress: u.deliveryAddress,
          location: u.location,
          gstNumber: u.gstNumber,
          gstVerified: u.gstVerified
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  console.log('✅ Demo Vendor & Supplier users seeded successfully!');
  console.log('  Vendor:   vendor@demo.com / 9876543210 (Password: password123)');
  console.log('  Supplier: supplier@demo.com / 9988776655 (Password: password123)');

  if (connectedHere) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDemoUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDemoUsers;
