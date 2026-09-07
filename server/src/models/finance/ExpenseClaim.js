const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const expenseClaimSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    claimantName: { type: String, required: true },
    budgetAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetAllocation', required: true },
    requestedAmount: { type: Number, required: true, min: 0 },
    justification: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'APPROVED', 'REJECTED'],
      default: 'SUBMITTED',
    },
  },
  { timestamps: true },
);

expenseClaimSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('expenseClaim', { prefix: 'EXP' });
  }
  next();
});

module.exports = mongoose.model('ExpenseClaim', expenseClaimSchema);
