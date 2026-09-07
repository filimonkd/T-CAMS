const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const leaveRequestSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    leaveBalance: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveBalance', required: true },
    requestedDays: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: {
      type: String,
      enum: ['SUBMITTED', 'APPROVED', 'REJECTED'],
      default: 'SUBMITTED',
    },
  },
  { timestamps: true },
);

leaveRequestSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('leaveRequest', { prefix: 'LVR' });
  }
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
