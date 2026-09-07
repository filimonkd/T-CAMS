const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

/**
 * Minimal addition to support assertPettyCashLimit - no petty cash fund
 * model existed yet in the earlier phases.
 */
const pettyCashFundSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    currentBalance: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

pettyCashFundSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('pettyCashFund', { prefix: 'PCF' });
  }
  next();
});

module.exports = mongoose.model('PettyCashFund', pettyCashFundSchema);
