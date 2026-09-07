const EmploymentContract = require('../../models/hr/EmploymentContract');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const {
  signEmploymentContract,
  activateEmploymentContract,
  terminateEmploymentContract,
} = require('../../services/hrService');

const controller = createCrudController(EmploymentContract);

controller.sign = async function sign(req, res, next) {
  try {
    const contract = await signEmploymentContract(req.params.id);
    res.json(contract);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.activate = async function activate(req, res, next) {
  try {
    const contract = await activateEmploymentContract(req.params.id);
    res.json(contract);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.terminate = async function terminate(req, res, next) {
  try {
    const contract = await terminateEmploymentContract(req.params.id);
    res.json(contract);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
