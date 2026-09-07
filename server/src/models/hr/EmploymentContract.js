const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const employmentContractSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    employeeName: { type: String, required: true },
    jobApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['DRAFT', 'SIGNED', 'ACTIVE', 'TERMINATED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true },
);

employmentContractSchema.pre('save', async function assignCode(next) {
  if (!this.code) {
    this.code = await getNextSequenceCode('employmentContract', { prefix: 'EMP' });
  }
  next();
});

module.exports = mongoose.model('EmploymentContract', employmentContractSchema);
