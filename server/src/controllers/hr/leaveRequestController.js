const LeaveRequest = require('../../models/hr/LeaveRequest');
const { handleGuardError } = require('../crudControllerFactory');
const {
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} = require('../../services/hrService');

/**
 * Requests are only created/approved/rejected through the guarded hrService
 * workflow so the leave-balance and clearance-hold checks can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const requests = await LeaveRequest.find().populate('leaveBalance');
      res.json(requests);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const request = await LeaveRequest.findById(req.params.id).populate('leaveBalance');
      if (!request) {
        return res.status(404).json({ message: 'Leave request not found.' });
      }
      res.json(request);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-HR-004: Submit Leave Request.
  async create(req, res, next) {
    try {
      const { leaveBalanceId, requestedDays, startDate, endDate, reason } = req.body;
      const request = await submitLeaveRequest(leaveBalanceId, requestedDays, startDate, endDate, reason);
      res.status(201).json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async approve(req, res, next) {
    try {
      const request = await approveLeaveRequest(req.params.id);
      res.json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async reject(req, res, next) {
    try {
      const request = await rejectLeaveRequest(req.params.id);
      res.json(request);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
