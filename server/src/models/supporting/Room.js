const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    building: { type: String },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true },
);

roomSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('room', { prefix: 'RM' });
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
