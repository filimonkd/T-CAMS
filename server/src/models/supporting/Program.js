const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const programSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'RETIRED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true },
);

programSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('program', { prefix: 'PRG' });
  }
  next();
});

module.exports = mongoose.model('Program', programSchema);
