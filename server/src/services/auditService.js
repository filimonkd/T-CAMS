const AuditLog = require('../models/AuditLog');
const { useCases } = require('../config/useCases');

const useCaseByCode = new Map(useCases.map((useCase) => [useCase.code, useCase]));

/**
 * Records one status-transition event. Called by guardService.transitionStatus
 * for every status change across every module, so this is the single place
 * new entries are written from. useCaseCode is optional - a transition with
 * no exact matching registry row (e.g. a withdraw/cancel action that isn't
 * separately registered) is still logged, just without isoClause/regulatoryClause.
 */
async function recordAuditEntry({ entityType, entityId, fromStatus, toStatus, useCaseCode }) {
  const useCase = useCaseCode ? useCaseByCode.get(useCaseCode) : undefined;

  return AuditLog.create({
    entityType,
    entityId,
    useCaseCode: useCaseCode || undefined,
    isoClause: useCase ? useCase.isoClause : undefined,
    regulatoryClause: useCase ? useCase.regulatoryClause : undefined,
    fromStatus,
    toStatus,
  });
}

// GET /api/audit/:entityType/:entityId - chronological history for one document.
async function getEntityHistory(entityType, entityId) {
  return AuditLog.find({ entityType, entityId }).sort({ occurredAt: 1 });
}

// GET /api/audit/compliance - cross-system lookup by ISO/regulatory clause and date range.
async function getComplianceLog({ isoClause, regulatoryClause, startDate, endDate }) {
  const query = {};
  if (isoClause) {
    query.isoClause = isoClause;
  }
  if (regulatoryClause) {
    query.regulatoryClause = regulatoryClause;
  }
  if (startDate || endDate) {
    query.occurredAt = {};
    if (startDate) {
      query.occurredAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.occurredAt.$lte = new Date(endDate);
    }
  }

  return AuditLog.find(query).sort({ occurredAt: -1 });
}

module.exports = { recordAuditEntry, getEntityHistory, getComplianceLog };
