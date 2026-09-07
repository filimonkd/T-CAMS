const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

/**
 * Minimal trainer directory entry, added to support assertTrainerLoad -
 * no staff/trainer model existed yet in the earlier phases.
 */
const trainerSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    contractHourLimit: { type: Number, required: true, min: 0 },
    scheduledHours: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

trainerSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('trainer', { prefix: 'TRN' });
  }
  next();
});

module.exports = mongoose.model('Trainer', trainerSchema);
