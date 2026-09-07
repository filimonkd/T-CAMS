const mongoose = require('mongoose');

const traineePlacementSchema = new mongoose.Schema(
  {
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    status: {
      type: String,
      enum: ['PLACED', 'WITHDRAWN'],
      default: 'PLACED',
    },
    placedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('TraineePlacement', traineePlacementSchema);
