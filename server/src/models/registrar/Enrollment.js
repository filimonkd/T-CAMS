const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    status: {
      type: String,
      enum: ['ENROLLED', 'WITHDRAWN'],
      default: 'ENROLLED',
    },
    enrolledAt: { type: Date, default: Date.now },
    withdrawnAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);
