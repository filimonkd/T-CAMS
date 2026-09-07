const mongoose = require('mongoose');

const loanRequestSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'],
      default: 'PENDING',
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('LoanRequest', loanRequestSchema);
