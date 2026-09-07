const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const budgetAllocationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    department: { type: String, required: true },
    fiscalYear: { type: String, required: true },
    allocatedAmount: { type: Number, required: true, min: 0 },
    spentAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'CLOSED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true },
);

budgetAllocationSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('budgetAllocation', { prefix: 'BUD' });
  }
  next();
});

module.exports = mongoose.model('BudgetAllocation', budgetAllocationSchema);
