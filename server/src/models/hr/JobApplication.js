const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const jobApplicationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    requisition: { type: mongoose.Schema.Types.ObjectId, ref: 'RecruitmentRequisition', required: true },
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'HIRED'],
      default: 'SUBMITTED',
    },
  },
  { timestamps: true },
);

jobApplicationSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('jobApplication', { prefix: 'APP' });
  }
  next();
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
