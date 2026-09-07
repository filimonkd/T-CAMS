const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

/**
 * Shared entity: created via either the RPB (Budget) or Finance module, each
 * driving it through its own approval chain (see approvalChainService.js).
 * RPB chain:     DRAFT -> BUDGET_OFFICER_REVIEW -> BUREAU_REVIEW -> APPROVED
 * FINANCE chain: DRAFT -> FINANCE_OFFICER_REVIEW -> AUDITOR_REVIEW -> BUREAU_REVIEW -> APPROVED
 */
const monthlyBudgetReportSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    formNumber: { type: String, default: 'GW/601-01' },
    department: { type: String, required: true },
    period: { type: String, required: true },
    budgetAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetAllocation' },
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

monthlyBudgetReportSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('monthlyBudgetReport', { prefix: 'MBR' });
  }
  next();
});

module.exports = mongoose.model('MonthlyBudgetReport', monthlyBudgetReportSchema);
