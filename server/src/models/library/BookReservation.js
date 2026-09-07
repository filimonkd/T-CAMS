const mongoose = require('mongoose');

const bookReservationSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    slotStart: { type: Date, required: true },
    slotEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED', 'COMPLETED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BookReservation', bookReservationSchema);
