const DepartmentBudgetRequest = require('../../models/budget/DepartmentBudgetRequest');
const { handleGuardError } = require('../crudControllerFactory');
const {
  submitDepartmentBudgetRequest,
  approveDepartmentBudgetRequest,
  rejectDepartmentBudgetRequest,
} = require('../../services/budgetService');

/**
 * Requests are only created/approved/rejected through the guarded
 * budgetService workflow so the budget-availability check can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const requests = await DepartmentBudgetRequest.find().populate('cycle').populate('budgetAllocation');
      res.json(requests);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const request = await DepartmentBudgetRequest.findById(req.params.id)
        .populate('cycle')
        .populate('budgetAllocation');
      if (!request) {
        return res.status(404).json({ message: 'Department budget request not found.' });
      }
      res.json(request);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-RPB-004: Submit Department Budget Request.
  async create(req, res, next) {
    try {
      const { cycleId, department, budgetAllocationId, requestedAmount } = req.body;
      const request = await submitDepartmentBudgetRequest(cycleId, department, budgetAllocationId, requestedAmount);
      res.status(201).json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async approve(req, res, next) {
    try {
      const request = await approveDepartmentBudgetRequest(req.params.id);
      res.json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async reject(req, res, next) {
    try {
      const request = await rejectDepartmentBudgetRequest(req.params.id);
      res.json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
