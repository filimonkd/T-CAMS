const MedicalClearance = require('../../models/hr/MedicalClearance');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { clearMedicalClearance, rejectMedicalClearance } = require('../../services/hrService');

const controller = createCrudController(MedicalClearance);

controller.clear = async function clear(req, res, next) {
  try {
    const clearance = await clearMedicalClearance(req.params.id);
    res.json(clearance);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.reject = async function reject(req, res, next) {
  try {
    const clearance = await rejectMedicalClearance(req.params.id);
    res.json(clearance);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
