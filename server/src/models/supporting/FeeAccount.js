const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const feeAccountSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    learnerName: { type: String, required: true },
    totalDue: { type: Number, required: true, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'OVERDUE', 'WAIVED', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

feeAccountSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('feeAccount', { prefix: 'FEE' });
  }
  next();
});

module.exports = mongoose.model('FeeAccount', feeAccountSchema);
