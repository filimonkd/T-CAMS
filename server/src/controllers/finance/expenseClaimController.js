const ExpenseClaim = require('../../models/finance/ExpenseClaim');
const { handleGuardError } = require('../crudControllerFactory');
const {
  submitExpenseClaim,
  approveExpenseClaim,
  rejectExpenseClaim,
} = require('../../services/financeService');

/**
 * Claims are only created/approved/rejected through the guarded
 * financeService workflow so the budget and justification-length checks
 * can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const claims = await ExpenseClaim.find().populate('budgetAllocation');
      res.json(claims);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const claim = await ExpenseClaim.findById(req.params.id).populate('budgetAllocation');
      if (!claim) {
        return res.status(404).json({ message: 'Expense claim not found.' });
      }
      res.json(claim);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-FIN-006: Submit Expense Claim.
  async create(req, res, next) {
    try {
      const { claimantName, budgetAllocationId, requestedAmount, justification } = req.body;
      const claim = await submitExpenseClaim(claimantName, budgetAllocationId, requestedAmount, justification);
      res.status(201).json(claim);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async approve(req, res, next) {
    try {
      const claim = await approveExpenseClaim(req.params.id);
      res.json(claim);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async reject(req, res, next) {
    try {
      const claim = await rejectExpenseClaim(req.params.id);
      res.json(claim);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
