const BudgetUtilizationEntry = require('../../models/budget/BudgetUtilizationEntry');
const { handleGuardError } = require('../crudControllerFactory');
const { recordBudgetUtilization } = require('../../services/budgetService');

/**
 * Entries are only created through the guarded budgetService workflow so
 * the budget-availability check can't be bypassed - this is a ledger, so
 * there is no update/delete once recorded.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const entries = await BudgetUtilizationEntry.find().populate('budgetAllocation');
      res.json(entries);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const entry = await BudgetUtilizationEntry.findById(req.params.id).populate('budgetAllocation');
      if (!entry) {
        return res.status(404).json({ message: 'Budget utilization entry not found.' });
      }
      res.json(entry);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-RPB-006: Record Budget Utilization Entry.
  async create(req, res, next) {
    try {
      const { budgetAllocationId, amount, description } = req.body;
      const entry = await recordBudgetUtilization(budgetAllocationId, amount, description);
      res.status(201).json(entry);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
