const crypto = require('crypto');
const Enrollment = require('../models/registrar/Enrollment');
const MonthlyBudgetReport = require('../models/budget/MonthlyBudgetReport');
const AnnualBudgetPlan = require('../models/budget/AnnualBudgetPlan');
const { ensure, ensureExists } = require('./guardService');
const { getEntityHistory } = require('./auditService');
const { getOverdueReport } = require('./libraryService');

function computeChecksum(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/**
 * Generic tamper-evident export for one document: its current data, the
 * complete AuditLog approval history for it, and a digital footprint of the
 * final recorded action plus a SHA-256 checksum over the whole payload.
 * Recomputing the checksum from the returned documentData/approvalHistory
 * and comparing it to digitalFootprint.checksum reveals any tampering after
 * the fact - this is what makes the payload safe to render as a signed
 * certificate/PDF on the frontend without re-fetching anything.
 */
async function generateTamperEvidentExport(Model, entityId) {
  const documentData = await Model.findById(entityId).lean();
  ensureExists(documentData, Model.modelName);

  const historyDocs = await getEntityHistory(Model.modelName, entityId);
  const approvalHistory = historyDocs.map((entry) => entry.toObject());
  const finalEntry = approvalHistory[approvalHistory.length - 1] || null;

  const digitalFootprint = {
    finalAuditLogId: finalEntry ? finalEntry._id : null,
    finalActionAt: finalEntry ? finalEntry.occurredAt : null,
    finalFromStatus: finalEntry ? finalEntry.fromStatus : null,
    finalToStatus: finalEntry ? finalEntry.toStatus : null,
    generatedAt: new Date(),
  };

  const checksum = computeChecksum({ documentData, approvalHistory, digitalFootprint });

  return {
    entityType: Model.modelName,
    entityId,
    documentData,
    approvalHistory,
    digitalFootprint: { ...digitalFootprint, checksum },
  };
}

// Registrar Qualifications: a learner's Enrollment record is their qualification proof.
async function generateQualificationCertificate(enrollmentId) {
  return generateTamperEvidentExport(Enrollment, enrollmentId);
}

// Library Overdue Reports: a point-in-time snapshot has no single document to
// attach an approval history to, so it gets its own footprint over the
// generated snapshot instead of reusing generateTamperEvidentExport.
async function generateOverdueReportExport() {
  const loans = await getOverdueReport();
  const generatedAt = new Date();
  const checksum = computeChecksum({ loans, generatedAt });

  return {
    reportType: 'LIBRARY_OVERDUE_REPORT',
    generatedAt,
    count: loans.length,
    loans,
    digitalFootprint: { generatedAt, checksum },
  };
}

// Finalized Budget Reports: only a report that has actually reached APPROVED
// (the end of either the RPB or Finance approval chain) can be exported.
async function generateBudgetReportExport(reportType, reportId) {
  const Model = reportType === 'ANNUAL' ? AnnualBudgetPlan : MonthlyBudgetReport;
  const document = await Model.findById(reportId);
  ensureExists(document, Model.modelName);
  ensure(document.status === 'APPROVED', 'Only an APPROVED report can be exported as finalized.', 'REPORT_NOT_FINALIZED');

  return generateTamperEvidentExport(Model, reportId);
}

module.exports = {
  generateTamperEvidentExport,
  generateQualificationCertificate,
  generateOverdueReportExport,
  generateBudgetReportExport,
};
