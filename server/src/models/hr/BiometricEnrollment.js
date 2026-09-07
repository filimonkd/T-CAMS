const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const biometricEnrollmentSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    employeeName: { type: String, required: true },
    biometricHash: { type: String, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

biometricEnrollmentSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('biometricEnrollment', { prefix: 'BIO' });
  }
  next();
});

module.exports = mongoose.model('BiometricEnrollment', biometricEnrollmentSchema);
