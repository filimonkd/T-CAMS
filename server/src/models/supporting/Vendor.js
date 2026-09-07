const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const vendorSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: { type: String },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED'],
      default: 'PENDING_APPROVAL',
    },
  },
  { timestamps: true },
);

vendorSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('vendor', { prefix: 'VEN' });
  }
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
