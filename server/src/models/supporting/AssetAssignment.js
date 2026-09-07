const mongoose = require('mongoose');
const { getNextSequenceCode } = require('../../services/sequenceService');

const assetAssignmentSchema = new mongoose.Schema(
  {
    assetTag: { type: String, unique: true },
    name: { type: String, required: true },
    category: { type: String },
    assignedTo: { type: String },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ASSIGNED', 'DAMAGED', 'RETIRED'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true },
);

assetAssignmentSchema.pre('save', async function assignTag(next) {
  if (!this.assetTag) {
    this.assetTag = await getNextSequenceCode('assetAssignment', { prefix: 'AST' });
  }
  next();
});

module.exports = mongoose.model('AssetAssignment', assetAssignmentSchema);
