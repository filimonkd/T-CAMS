const RecruitmentRequisition = require('../../models/hr/RecruitmentRequisition');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const {
  approveRecruitmentRequisition,
  closeRecruitmentRequisition,
  rejectRecruitmentRequisition,
} = require('../../services/hrService');

const controller = createCrudController(RecruitmentRequisition);

controller.approve = async function approve(req, res, next) {
  try {
    const requisition = await approveRecruitmentRequisition(req.params.id);
    res.json(requisition);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.close = async function close(req, res, next) {
  try {
    const requisition = await closeRecruitmentRequisition(req.params.id);
    res.json(requisition);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.reject = async function reject(req, res, next) {
  try {
    const requisition = await rejectRecruitmentRequisition(req.params.id);
    res.json(requisition);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
