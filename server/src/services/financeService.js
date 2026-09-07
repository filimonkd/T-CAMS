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

// UC-ADMIN-FIN-003/004: Create Bid Evaluation (blocked on an unapproved vendor).
async function createBidEvaluation(bidId, score, evaluatorNotes) {
  const bid = await Bid.findById(bidId);
  ensureExists(bid, 'Bid');

  const vendor = await Vendor.findById(bid.vendor);
  assertVendorApproved(vendor);

  const evaluation = await BidEvaluation.create({ bid: bidId, score, evaluatorNotes });

  transitionStatus(bid, 'status', ['SUBMITTED'], 'EVALUATED');
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

  transitionStatus(evaluation, 'status', ['PENDING'], 'FINALIZED');
  await evaluation.save();

  transitionStatus(bid, 'status', ['EVALUATED'], 'AWARDED');
  await bid.save();

  return evaluation;
}

async function rejectBidEvaluation(evaluationId) {
  const evaluation = await BidEvaluation.findById(evaluationId);
  ensureExists(evaluation, 'Bid evaluation');
  transitionStatus(evaluation, 'status', ['PENDING'], 'REJECTED');
  await evaluation.save();

  const bid = await Bid.findById(evaluation.bid);
  ensureExists(bid, 'Bid');
  transitionStatus(bid, 'status', ['EVALUATED'], 'REJECTED');
  await bid.save();

  return evaluation;
}

// UC-ADMIN-FIN-005: Issue Purchase Order (blocked on an unapproved vendor).
async function issuePurchaseOrder(vendorId, bidId, budgetAllocationId, amount) {
  const vendor = await Vendor.findById(vendorId);
  assertVendorApproved(vendor);

  const order = await PurchaseOrder.create({
    vendor: vendorId,
    bid: bidId,
    budgetAllocation: budgetAllocationId,
    amount,
  });

  transitionStatus(order, 'status', ['DRAFT'], 'ISSUED');
  await order.save();

  return order;
}

async function fulfillPurchaseOrder(orderId) {
  const order = await PurchaseOrder.findById(orderId);
  ensureExists(order, 'Purchase order');
  transitionStatus(order, 'status', ['ISSUED'], 'FULFILLED');
  await order.save();
  return order;
}

async function cancelPurchaseOrder(orderId) {
  const order = await PurchaseOrder.findById(orderId);
  ensureExists(order, 'Purchase order');
  transitionStatus(order, 'status', ['DRAFT', 'ISSUED'], 'CANCELLED');
  await order.save();
  return order;
}

// UC-ADMIN-FIN-006: Submit Expense Claim (blocked on budget or a too-short justification).
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

  transitionStatus(claim, 'status', ['SUBMITTED'], 'APPROVED');
  await claim.save();

  budgetAllocation.spentAmount += claim.requestedAmount;
  await budgetAllocation.save();

  return claim;
}

async function rejectExpenseClaim(claimId) {
  const claim = await ExpenseClaim.findById(claimId);
  ensureExists(claim, 'Expense claim');
  transitionStatus(claim, 'status', ['SUBMITTED'], 'REJECTED');
  await claim.save();
  return claim;
}

// UC-ADMIN-FIN-007: Record Petty Cash Transaction (blocked over the fund's current balance).
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
  transitionStatus(transaction, 'status', ['RECORDED'], 'VOIDED');
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
