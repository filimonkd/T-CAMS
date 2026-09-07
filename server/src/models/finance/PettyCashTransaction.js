const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const pettyCashTransactionSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    pettyCashFund: { type: mongoose.Schema.Types.ObjectId, ref: 'PettyCashFund', required: true },
    amount: { type: Number, required: true, min: 0 },
    purpose: { type: String, required: true },
    status: {
      type: String,
      enum: ['RECORDED', 'VOIDED'],
      default: 'RECORDED',
    },
  },
  { timestamps: true },
);

pettyCashTransactionSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('pettyCashTransaction', { prefix: 'PCT' });
  }
  next();
});

module.exports = mongoose.model('PettyCashTransaction', pettyCashTransactionSchema);
