const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const propertyClearanceSchema = new mongoose.Schema(
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

propertyClearanceSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('propertyClearance', { prefix: 'PROP' });
  }
  next();
});

module.exports = mongoose.model('PropertyClearance', propertyClearanceSchema);
