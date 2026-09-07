const Vendor = require('../models/supporting/Vendor');
const BudgetAllocation = require('../models/supporting/BudgetAllocation');
const Bid = require('../models/finance/Bid');
const BidEvaluation = require('../models/finance/BidEvaluation');
const PurchaseOrder = require('../models/finance/PurchaseOrder');
const ExpenseClaim = require('../models/finance/ExpenseClaim');
const PettyCashFund = require('../models/finance/PettyCashFund');
const PettyCashTransaction = require('../models/finance/PettyCashTransaction');
const {
  ensureExists,
  transitionStatus,
  assertBudgetAvailable,
  assertVendorApproved,
  assertBidScoreThreshold,
  assertPettyCashLimit,
  assertExpenseJustification,
} = require('./guardService');

async function submitBid(vendorId, description, amount) {
  return Bid.create({ vendor: vendorId, description, amount });
}

// UC-ADMIN-FIN-003: Create Bid Evaluation (blocked on an unapproved vendor).
async function createBidEvaluation(bidId, score, evaluatorNotes) {
  const bid = await Bid.findById(bidId);
  ensureExists(bid, 'Bid');

  const vendor = await Vendor.findById(bid.vendor);
  assertVendorApproved(vendor);

  const evaluation = await BidEvaluation.create({ bid: bidId, score, evaluatorNotes });

  await transitionStatus(bid, 'status', ['SUBMITTED'], 'EVALUATED', 'UC-ADMIN-FIN-003');
  await bid.save();

  return evaluation;
}

// Finalizing an evaluation awards the bid (blocked on vendor approval and score threshold).
async function finalizeBidEvaluation(evaluationId) {
  const evaluation = await BidEvaluation.findById(evaluationId);
  ensureExists(evaluation, 'Bid evaluation');

  const bid = await Bid.findById(evaluation.bid);
  ensureExists(bid, 'Bid');

  const vendor = await Vendor.findById(bid.vendor);
  assertVendorApproved(vendor);
  assertBidScoreThreshold(evaluation.score);

  await transitionStatus(evaluation, 'status', ['PENDING'], 'FINALIZED', 'UC-ADMIN-FIN-003');
  await evaluation.save();

  await transitionStatus(bid, 'status', ['EVALUATED'], 'AWARDED', 'UC-ADMIN-FIN-003');
  await bid.save();

  return evaluation;
}

async function rejectBidEvaluation(evaluationId) {
  const evaluation = await BidEvaluation.findById(evaluationId);
  ensureExists(evaluation, 'Bid evaluation');
  await transitionStatus(evaluation, 'status', ['PENDING'], 'REJECTED', 'UC-ADMIN-FIN-003');
  await evaluation.save();

  const bid = await Bid.findById(evaluation.bid);
  ensureExists(bid, 'Bid');
  await transitionStatus(bid, 'status', ['EVALUATED'], 'REJECTED', 'UC-ADMIN-FIN-003');
  await bid.save();

  return evaluation;
}

// UC-ADMIN-FIN-004: Issue Purchase Order (blocked on an unapproved vendor).
async function issuePurchaseOrder(vendorId, bidId, budgetAllocationId, amount) {
  const vendor = await Vendor.findById(vendorId);
  assertVendorApproved(vendor);

  const order = await PurchaseOrder.create({
    vendor: vendorId,
    bid: bidId,
    budgetAllocation: budgetAllocationId,
    amount,
  });

  await transitionStatus(order, 'status', ['DRAFT'], 'ISSUED', 'UC-ADMIN-FIN-004');
  await order.save();

  return order;
}

async function fulfillPurchaseOrder(orderId) {
  const order = await PurchaseOrder.findById(orderId);
  ensureExists(order, 'Purchase order');
  await transitionStatus(order, 'status', ['ISSUED'], 'FULFILLED', 'UC-ADMIN-FIN-004');
  await order.save();
  return order;
}

async function cancelPurchaseOrder(orderId) {
  const order = await PurchaseOrder.findById(orderId);
  ensureExists(order, 'Purchase order');
  await transitionStatus(order, 'status', ['DRAFT', 'ISSUED'], 'CANCELLED', 'UC-ADMIN-FIN-004');
  await order.save();
  return order;
}

// UC-ADMIN-FIN-005: Submit Expense Claim (blocked on budget or a too-short justification).
async function submitExpenseClaim(claimantName, budgetAllocationId, requestedAmount, justification) {
  assertExpenseJustification(justification);

  const budgetAllocation = await BudgetAllocation.findById(budgetAllocationId);
  assertBudgetAvailable(budgetAllocation, requestedAmount);

  return ExpenseClaim.create({
    claimantName,
    budgetAllocation: budgetAllocationId,
    requestedAmount,
    justification,
  });
}

async function approveExpenseClaim(claimId) {
  const claim = await ExpenseClaim.findById(claimId);
  ensureExists(claim, 'Expense claim');

  const budgetAllocation = await BudgetAllocation.findById(claim.budgetAllocation);
  assertBudgetAvailable(budgetAllocation, claim.requestedAmount);

  await transitionStatus(claim, 'status', ['SUBMITTED'], 'APPROVED', 'UC-ADMIN-FIN-005');
  await claim.save();

  budgetAllocation.spentAmount += claim.requestedAmount;
  await budgetAllocation.save();

  return claim;
}

async function rejectExpenseClaim(claimId) {
  const claim = await ExpenseClaim.findById(claimId);
  ensureExists(claim, 'Expense claim');
  await transitionStatus(claim, 'status', ['SUBMITTED'], 'REJECTED', 'UC-ADMIN-FIN-005');
  await claim.save();
  return claim;
}

// UC-ADMIN-FIN-006: Record Petty Cash Transaction (blocked over the fund's current balance).
async function recordPettyCashTransaction(fundId, amount, purpose) {
  const fund = await PettyCashFund.findById(fundId);
  assertPettyCashLimit(fund, amount);

  const transaction = await PettyCashTransaction.create({ pettyCashFund: fundId, amount, purpose });

  fund.currentBalance -= amount;
  await fund.save();

  return transaction;
}

async function voidPettyCashTransaction(transactionId) {
  const transaction = await PettyCashTransaction.findById(transactionId);
  ensureExists(transaction, 'Petty cash transaction');
  await transitionStatus(transaction, 'status', ['RECORDED'], 'VOIDED', 'UC-ADMIN-FIN-006');
  await transaction.save();

  const fund = await PettyCashFund.findById(transaction.pettyCashFund);
  ensureExists(fund, 'Petty cash fund');
  fund.currentBalance += transaction.amount;
  await fund.save();

  return transaction;
}

module.exports = {
  submitBid,
  createBidEvaluation,
  finalizeBidEvaluation,
  rejectBidEvaluation,
  issuePurchaseOrder,
  fulfillPurchaseOrder,
  cancelPurchaseOrder,
  submitExpenseClaim,
  approveExpenseClaim,
  rejectExpenseClaim,
  recordPettyCashTransaction,
  voidPettyCashTransaction,
};
