const mongoose = require('mongoose');

/**
 * One entry per status transition recorded by guardService.transitionStatus.
 * isoClause/regulatoryClause are denormalized at write time from the
 * useCases.js registry entry named by useCaseCode, so compliance queries
 * don't need a join back to the (code-only, not a collection) registry.
 */
const auditLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    useCaseCode: { type: String },
    isoClause: { type: String },
    regulatoryClause: { type: String },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

auditLogSchema.index({ entityType: 1, entityId: 1, occurredAt: 1 });
auditLogSchema.index({ isoClause: 1, occurredAt: -1 });
auditLogSchema.index({ regulatoryClause: 1, occurredAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
