const LeaveBalance = require('../../models/supporting/LeaveBalance');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensureExists, assertLeaveBalance, ensureStatusTransitionAllowed } = require('../../services/guardService');

const controller = createCrudController(LeaveBalance);

// HR-003: Approve Leave Request (blocked if insufficient balance or wrong state).
controller.approve = async function approve(req, res, next) {
  try {
    const { days } = req.body;
    const leaveBalance = await LeaveBalance.findById(req.params.id);
    ensureExists(leaveBalance, 'Leave balance');
    ensureStatusTransitionAllowed(leaveBalance.status, ['ACTIVE'], 'ACTIVE');
    assertLeaveBalance(leaveBalance, days);

    leaveBalance.usedDays += days;
    await leaveBalance.save();
    res.json(leaveBalance);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
