const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const medicalClearanceSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    employeeName: { type: String, required: true },
    requestedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['PENDING', 'CLEARED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

medicalClearanceSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('medicalClearance', { prefix: 'MED' });
  }
  next();
});

module.exports = mongoose.model('MedicalClearance', medicalClearanceSchema);
