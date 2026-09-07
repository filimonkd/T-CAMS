const MaintenanceRequisition = require('../../models/department/MaintenanceRequisition');
const { handleGuardError } = require('../crudControllerFactory');
const {
  submitMaintenanceRequisition,
  approveMaintenanceRequisition,
  completeMaintenanceRequisition,
} = require('../../services/departmentService');

/**
 * Requisitions are only created/approved/completed through the guarded
 * departmentService workflow so the budget check and Room status
 * transitions can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const requisitions = await MaintenanceRequisition.find().populate('room').populate('budgetAllocation');
      res.json(requisitions);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const requisition = await MaintenanceRequisition.findById(req.params.id)
        .populate('room')
        .populate('budgetAllocation');
      if (!requisition) {
        return res.status(404).json({ message: 'Maintenance requisition not found.' });
      }
      res.json(requisition);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-DEPT-005: Submit Maintenance Requisition.
  async create(req, res, next) {
    try {
      const { roomId, budgetAllocationId, description, estimatedCost } = req.body;
      const requisition = await submitMaintenanceRequisition(roomId, budgetAllocationId, description, estimatedCost);
      res.status(201).json(requisition);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async approve(req, res, next) {
    try {
      const requisition = await approveMaintenanceRequisition(req.params.id);
      res.json(requisition);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async complete(req, res, next) {
    try {
      const requisition = await completeMaintenanceRequisition(req.params.id);
      res.json(requisition);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
