const MaterialRequest = require('../../models/department/MaterialRequest');
const { handleGuardError } = require('../crudControllerFactory');
const {
  submitMaterialRequest,
  approveMaterialRequest,
  rejectMaterialRequest,
} = require('../../services/departmentService');

/**
 * Requests are only created/approved/rejected through the guarded
 * departmentService workflow so the stock and budget checks can't be
 * bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const requests = await MaterialRequest.find().populate('stockItem').populate('budgetAllocation');
      res.json(requests);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const request = await MaterialRequest.findById(req.params.id)
        .populate('stockItem')
        .populate('budgetAllocation');
      if (!request) {
        return res.status(404).json({ message: 'Material request not found.' });
      }
      res.json(request);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-DEPT-003: Submit Material Request.
  async create(req, res, next) {
    try {
      const { stockItemId, budgetAllocationId, quantityRequested, estimatedCost } = req.body;
      const request = await submitMaterialRequest(stockItemId, budgetAllocationId, quantityRequested, estimatedCost);
      res.status(201).json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async approve(req, res, next) {
    try {
      const request = await approveMaterialRequest(req.params.id);
      res.json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async reject(req, res, next) {
    try {
      const request = await rejectMaterialRequest(req.params.id);
      res.json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
