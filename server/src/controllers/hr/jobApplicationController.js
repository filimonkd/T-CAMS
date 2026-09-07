const JobApplication = require('../../models/hr/JobApplication');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const {
  shortlistJobApplication,
  rejectJobApplication,
  hireJobApplication,
} = require('../../services/hrService');

const controller = createCrudController(JobApplication);

controller.shortlist = async function shortlist(req, res, next) {
  try {
    const application = await shortlistJobApplication(req.params.id);
    res.json(application);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.reject = async function reject(req, res, next) {
  try {
    const application = await rejectJobApplication(req.params.id);
    res.json(application);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

controller.hire = async function hire(req, res, next) {
  try {
    const application = await hireJobApplication(req.params.id);
    res.json(application);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
