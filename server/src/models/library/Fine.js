const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const fineSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    overdueDays: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['UNPAID', 'PAID', 'WAIVED'],
      default: 'UNPAID',
    },
  },
  { timestamps: true },
);

fineSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('fine', { prefix: 'LFN' });
  }
  next();
});

module.exports = mongoose.model('Fine', fineSchema);
