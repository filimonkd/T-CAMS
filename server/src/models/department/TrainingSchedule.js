const mongoose = require('mongoose');

const trainingScheduleSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    scheduledDate: { type: Date, required: true },
    hours: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['SCHEDULED', 'CANCELLED', 'COMPLETED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('TrainingSchedule', trainingScheduleSchema);
