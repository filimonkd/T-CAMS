const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

/**
 * Shared entity - see MonthlyBudgetReport.js for the dual RPB/FINANCE
 * approval chain this model is also driven through.
 */
const annualBudgetPlanSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    formNumber: { type: String, default: 'GW/601-02' },
    department: { type: String, required: true },
    fiscalYear: { type: String, required: true },
    totalRequestedAmount: { type: Number, required: true, min: 0 },
    approvalChain: { type: String, enum: ['RPB', 'FINANCE'], required: true },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'BUDGET_OFFICER_REVIEW',
        'FINANCE_OFFICER_REVIEW',
        'AUDITOR_REVIEW',
        'BUREAU_REVIEW',
        'APPROVED',
        'REJECTED',
      ],
      default: 'DRAFT',
    },
  },
  { timestamps: true },
);

annualBudgetPlanSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('annualBudgetPlan', { prefix: 'ABP' });
  }
  next();
});

module.exports = mongoose.model('AnnualBudgetPlan', annualBudgetPlanSchema);
