const mongoose = require('mongoose');

const materialRequestSchema = new mongoose.Schema(
  {
    stockItem: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItem', required: true },
    budgetAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetAllocation', required: true },
    quantityRequested: { type: Number, required: true, min: 1 },
    estimatedCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'REJECTED'],
      default: 'REQUESTED',
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('MaterialRequest', materialRequestSchema);
