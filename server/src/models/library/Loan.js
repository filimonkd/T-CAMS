const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const loanSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    loanRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanRequest' },
    status: {
      type: String,
      enum: ['ACTIVE', 'RETURNED'],
      default: 'ACTIVE',
    },
    issuedAt: { type: Date, default: Date.now },
    dueAt: { type: Date, required: true },
    returnedAt: { type: Date },
  },
  { timestamps: true },
);

loanSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('loan', { prefix: 'LOAN' });
  }
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
