const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const budgetUtilizationEntrySchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    budgetAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetAllocation', required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

budgetUtilizationEntrySchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('budgetUtilizationEntry', { prefix: 'BUE' });
  }
  next();
});

module.exports = mongoose.model('BudgetUtilizationEntry', budgetUtilizationEntrySchema);
