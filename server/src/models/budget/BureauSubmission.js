const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const bureauSubmissionSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetRequestCycle', required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true },
);

bureauSubmissionSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('bureauSubmission', { prefix: 'BUR' });
  }
  next();
});

module.exports = mongoose.model('BureauSubmission', bureauSubmissionSchema);
