const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const stockItemSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true },
    name: { type: String, required: true },
    category: { type: String },
    unit: { type: String, default: 'each' },
    quantityOnHand: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  },
  { timestamps: true },
);

stockItemSchema.pre('save', async function assignSku(next) {
  if (!this.sku) {
    this.sku = await getNextSequenceCode('stockItem', { prefix: 'SKU' });
  }
  next();
});

module.exports = mongoose.model('StockItem', stockItemSchema);
