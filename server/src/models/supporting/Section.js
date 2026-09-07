const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const sectionSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    term: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    enrolledCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
    },
  },
  { timestamps: true },
);

sectionSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('section', { prefix: 'SEC' });
  }
  next();
});

module.exports = mongoose.model('Section', sectionSchema);
