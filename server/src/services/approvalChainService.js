const { ensure, ensureExists, transitionStatus } = require('./guardService');

/**
 * MonthlyBudgetReport and AnnualBudgetPlan are shared entities defined once
 * but driven through one of two variant approval chains depending on which
 * module (RPB/Budget or Finance) originates them. Both chains share the
 * `status` field and a single model; the chain itself (`approvalChain`)
 * decides which sequence of stages is legal.
 */
const APPROVAL_CHAINS = {
  RPB: ['DRAFT', 'BUDGET_OFFICER_REVIEW', 'BUREAU_REVIEW', 'APPROVED'],
  FINANCE: ['DRAFT', 'FINANCE_OFFICER_REVIEW', 'AUDITOR_REVIEW', 'BUREAU_REVIEW', 'APPROVED'],
};

// Maps (model, chain) to the useCases.js registry row for that variant, so
// transitions get attributed to the right isoClause/regulatoryClause.
const USE_CASE_CODES = {
  MonthlyBudgetReport: { RPB: 'UC-ADMIN-RPB-001', FINANCE: 'UC-ADMIN-FIN-001' },
  AnnualBudgetPlan: { RPB: 'UC-ADMIN-RPB-002', FINANCE: 'UC-ADMIN-FIN-002' },
};

// Advances a report/plan to the next stage of its own approval chain.
async function advanceReport(Model, id) {
  const doc = await Model.findById(id);
  ensureExists(doc, Model.modelName);

  const chain = APPROVAL_CHAINS[doc.approvalChain];
  const currentIndex = chain.indexOf(doc.status);
  // A status outside the forward chain (e.g. REJECTED) or already at the
  // final stage (APPROVED) has no legal next stage - without this check
  // `[doc.status]` as the allowed-from list trivially always matches the
  // document's own current status, so transitionStatus would never block it.
  ensure(
    currentIndex !== -1 && currentIndex < chain.length - 1,
    `Cannot advance ${Model.modelName} from status "${doc.status}".`,
    'INVALID_STATUS_TRANSITION',
  );

  const nextStatus = chain[currentIndex + 1];
  const useCaseCode = (USE_CASE_CODES[Model.modelName] || {})[doc.approvalChain];
  await transitionStatus(doc, 'status', [doc.status], nextStatus, useCaseCode);
  await doc.save();
  return doc;
}

// Rejects a report/plan from any of its chain's review stages.
async function rejectReport(Model, id) {
  const doc = await Model.findById(id);
  ensureExists(doc, Model.modelName);

  const chain = APPROVAL_CHAINS[doc.approvalChain];
  const reviewStages = chain.slice(1, -1);
  const useCaseCode = (USE_CASE_CODES[Model.modelName] || {})[doc.approvalChain];

  await transitionStatus(doc, 'status', reviewStages, 'REJECTED', useCaseCode);
  await doc.save();
  return doc;
}

module.exports = { APPROVAL_CHAINS, advanceReport, rejectReport };
