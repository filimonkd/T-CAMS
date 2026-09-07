const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const departmentBudgetRequestSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetRequestCycle', required: true },
    department: { type: String, required: true },
    budgetAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetAllocation', required: true },
    requestedAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['SUBMITTED', 'APPROVED', 'REJECTED'],
      default: 'SUBMITTED',
    },
  },
  { timestamps: true },
);

departmentBudgetRequestSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('departmentBudgetRequest', { prefix: 'DBR' });
  }
  next();
});

module.exports = mongoose.model('DepartmentBudgetRequest', departmentBudgetRequestSchema);
