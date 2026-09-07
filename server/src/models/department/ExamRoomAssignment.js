const mongoose = require('mongoose');

const examRoomAssignmentSchema = new mongoose.Schema(
  {
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    examDate: { type: Date, required: true },
    cohortSize: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['ASSIGNED', 'CANCELLED', 'COMPLETED'],
      default: 'ASSIGNED',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ExamRoomAssignment', examRoomAssignmentSchema);
