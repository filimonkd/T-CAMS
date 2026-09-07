const PropertyClearance = require('../../models/hr/PropertyClearance');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { clearPropertyClearance, rejectPropertyClearance } = require('../../services/hrService');

const controller = createCrudController(PropertyClearance);

controller.clear = async function clear(req, res, next) {
  try {
    const clearance = await clearPropertyClearance(req.params.id);
    res.json(clearance);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.reject = async function reject(req, res, next) {
  try {
    const clearance = await rejectPropertyClearance(req.params.id);
    res.json(clearance);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
