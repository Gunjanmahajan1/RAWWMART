// ─────────────────────────────────────────
//  RAWWMART - AI Chat Session Model
// ─────────────────────────────────────────

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender:    { type: String, enum: ['user', 'assistant'], required: true },
  text:      { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata:  {
    dish:        { type: String },
    servings:    { type: Number },
    budget:      { type: Number },
    date:        { type: String },
    constraints: [{ type: String }],
    recommendation: { type: mongoose.Schema.Types.Mixed }
  }
});

const AIChatSessionSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, default: 'Raw Material Assistance' },
  messages:     [MessageSchema],
  activeCart:   [{
    product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:       { type: String },
    quantity:   { type: Number },
    unit:       { type: String },
    packSize:   { type: Number },
    pricePerPack: { type: Number },
    totalPrice: { type: Number },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    supplierName: { type: String }
  }],
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now }
});

AIChatSessionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('AIChatSession', AIChatSessionSchema);
