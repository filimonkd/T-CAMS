const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const bidSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['SUBMITTED', 'EVALUATED', 'AWARDED', 'REJECTED'],
      default: 'SUBMITTED',
    },
  },
  { timestamps: true },
);

bidSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('bid', { prefix: 'BID' });
  }
  next();
});

module.exports = mongoose.model('Bid', bidSchema);
