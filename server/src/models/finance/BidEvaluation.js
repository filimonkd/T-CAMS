const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const bidEvaluationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    evaluatorNotes: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'FINALIZED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

bidEvaluationSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('bidEvaluation', { prefix: 'BEV' });
  }
  next();
});

module.exports = mongoose.model('BidEvaluation', bidEvaluationSchema);
