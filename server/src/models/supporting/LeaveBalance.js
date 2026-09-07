const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    leaveType: { type: String, required: true, default: 'ANNUAL' },
    year: { type: Number, required: true },
    entitledDays: { type: Number, required: true, min: 0 },
    usedDays: { type: Number, default: 0, min: 0 },
    carriedOverDays: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_APPROVAL', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

leaveBalanceSchema.index({ employeeName: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
