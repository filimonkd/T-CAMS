const mongoose = require('mongoose');

/**
 * Scoped to Room targets for now (Room already models a MAINTENANCE
 * status from Phase 2's Facilities module); extending to AssetAssignment
 * targets can follow the same shape later if needed.
 */
const maintenanceRequisitionSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    budgetAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetAllocation', required: true },
    description: { type: String, required: true },
    estimatedCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'COMPLETED'],
      default: 'REQUESTED',
    },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('MaintenanceRequisition', maintenanceRequisitionSchema);
