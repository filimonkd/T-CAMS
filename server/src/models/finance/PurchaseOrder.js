const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const purchaseOrderSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    budgetAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetAllocation' },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'FULFILLED', 'CANCELLED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true },
);

purchaseOrderSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('purchaseOrder', { prefix: 'PO' });
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
