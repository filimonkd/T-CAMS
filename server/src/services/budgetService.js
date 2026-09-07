const BudgetRequestCycle = require('../models/budget/BudgetRequestCycle');
const DepartmentBudgetRequest = require('../models/budget/DepartmentBudgetRequest');
const BureauSubmission = require('../models/budget/BureauSubmission');
const BudgetUtilizationEntry = require('../models/budget/BudgetUtilizationEntry');
const BudgetAllocation = require('../models/supporting/BudgetAllocation');
const { ensureExists, transitionStatus, assertBudgetAvailable } = require('./guardService');

async function closeBudgetRequestCycle(cycleId) {
  const cycle = await BudgetRequestCycle.findById(cycleId);
  ensureExists(cycle, 'Budget request cycle');
  await transitionStatus(cycle, 'status', ['OPEN'], 'CLOSED', 'UC-ADMIN-RPB-003');
  cycle.closeDate = new Date();
  await cycle.save();
  return cycle;
}

// UC-ADMIN-RPB-004: Submit Department Budget Request (blocked on insufficient budget).
async function submitDepartmentBudgetRequest(cycleId, department, budgetAllocationId, requestedAmount) {
  const budgetAllocation = await BudgetAllocation.findById(budgetAllocationId);
  assertBudgetAvailable(budgetAllocation, requestedAmount);

  return DepartmentBudgetRequest.create({
    cycle: cycleId,
    department,
    budgetAllocation: budgetAllocationId,
    requestedAmount,
  });
}

// Approving commits the spend against the underlying BudgetAllocation.
async function approveDepartmentBudgetRequest(requestId) {
  const request = await DepartmentBudgetRequest.findById(requestId);
  ensureExists(request, 'Department budget request');

  const budgetAllocation = await BudgetAllocation.findById(request.budgetAllocation);
  assertBudgetAvailable(budgetAllocation, request.requestedAmount);

  await transitionStatus(request, 'status', ['SUBMITTED'], 'APPROVED', 'UC-ADMIN-RPB-004');
  await request.save();

  budgetAllocation.spentAmount += request.requestedAmount;
  await budgetAllocation.save();

  return request;
}

async function rejectDepartmentBudgetRequest(requestId) {
  const request = await DepartmentBudgetRequest.findById(requestId);
  ensureExists(request, 'Department budget request');
  await transitionStatus(request, 'status', ['SUBMITTED'], 'REJECTED', 'UC-ADMIN-RPB-004');
  await request.save();
  return request;
}

// UC-ADMIN-RPB-005: aggregates a cycle's approved requests into a Bureau submission.
async function createBureauSubmission(cycleId) {
  const approvedRequests = await DepartmentBudgetRequest.find({ cycle: cycleId, status: 'APPROVED' });
  const totalAmount = approvedRequests.reduce((sum, request) => sum + request.requestedAmount, 0);

  return BureauSubmission.create({ cycle: cycleId, totalAmount });
}

async function submitBureauSubmission(submissionId) {
  const submission = await BureauSubmission.findById(submissionId);
  ensureExists(submission, 'Bureau submission');
  await transitionStatus(submission, 'status', ['DRAFT'], 'SUBMITTED', 'UC-ADMIN-RPB-005');
  await submission.save();
  return submission;
}

async function acknowledgeBureauSubmission(submissionId) {
  const submission = await BureauSubmission.findById(submissionId);
  ensureExists(submission, 'Bureau submission');
  await transitionStatus(submission, 'status', ['SUBMITTED'], 'ACKNOWLEDGED', 'UC-ADMIN-RPB-005');
  await submission.save();
  return submission;
}

// UC-ADMIN-RPB-006: Record Budget Utilization Entry (blocked on insufficient budget).
async function recordBudgetUtilization(budgetAllocationId, amount, description) {
  const budgetAllocation = await BudgetAllocation.findById(budgetAllocationId);
  assertBudgetAvailable(budgetAllocation, amount);

  const entry = await BudgetUtilizationEntry.create({ budgetAllocation: budgetAllocationId, amount, description });

  budgetAllocation.spentAmount += amount;
  await budgetAllocation.save();

  return entry;
}

module.exports = {
  closeBudgetRequestCycle,
  submitDepartmentBudgetRequest,
  approveDepartmentBudgetRequest,
  rejectDepartmentBudgetRequest,
  createBureauSubmission,
  submitBureauSubmission,
  acknowledgeBureauSubmission,
  recordBudgetUtilization,
};
