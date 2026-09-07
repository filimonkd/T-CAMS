const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const recruitmentRequisitionSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    department: { type: String, required: true },
    jobTitle: { type: String, required: true },
    headcount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'CLOSED', 'REJECTED'],
      default: 'REQUESTED',
    },
  },
  { timestamps: true },
);

recruitmentRequisitionSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('recruitmentRequisition', { prefix: 'RRQ' });
  }
  next();
});

module.exports = mongoose.model('RecruitmentRequisition', recruitmentRequisitionSchema);
