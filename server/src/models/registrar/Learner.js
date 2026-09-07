const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const learnerSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'WITHDRAWN'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

learnerSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('learner', { prefix: 'LRN' });
  }
  next();
});

module.exports = mongoose.model('Learner', learnerSchema);
