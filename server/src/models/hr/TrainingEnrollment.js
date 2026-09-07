const mongoose = require('mongoose');

const trainingEnrollmentSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    trainingSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingSchedule', required: true },
    status: {
      type: String,
      enum: ['ENROLLED', 'COMPLETED', 'CANCELLED'],
      default: 'ENROLLED',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('TrainingEnrollment', trainingEnrollmentSchema);
