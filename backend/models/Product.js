// ─────────────────────────────────────────
//  RAWWMART - Product Model
// ─────────────────────────────────────────

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, required: true }, // e.g. Vegetables, Spices, Dairy, Grains, Bakery
  tags:        [{ type: String }],              // e.g. ['potato', 'batata', 'aloo']
  price:       { type: Number, required: true }, // price per pack or per unit
  unit:        { type: String, required: true }, // e.g. 'kg', 'litre', 'piece', 'packet', 'bag'
  packSize:    { type: Number, default: 1 },    // e.g. 5 (for 5kg bag) or 1 (for 1kg)
  packUnit:    { type: String, default: 'kg' }, // e.g. 'kg', 'g', 'L', 'ml', 'pcs'
  stock:       { type: Number, default: 100 },  // available packs in stock
  supplier:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl:    { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

ProductSchema.index({ name: 'text', tags: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
