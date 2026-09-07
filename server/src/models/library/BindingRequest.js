const mongoose = require('mongoose');

const bindingRequestSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['REQUESTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'REQUESTED',
    },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BindingRequest', bindingRequestSchema);
