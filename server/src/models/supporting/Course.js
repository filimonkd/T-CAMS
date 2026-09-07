const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    title: { type: String, required: true },
    credits: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'RETIRED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

courseSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('course', { prefix: 'CRS' });
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
