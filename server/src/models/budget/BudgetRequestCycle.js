const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const budgetRequestCycleSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    fiscalYear: { type: String, required: true },
    openDate: { type: Date, default: Date.now },
    closeDate: { type: Date },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
    },
  },
  { timestamps: true },
);

budgetRequestCycleSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('budgetRequestCycle', { prefix: 'CYC' });
  }
  next();
});

module.exports = mongoose.model('BudgetRequestCycle', budgetRequestCycleSchema);
