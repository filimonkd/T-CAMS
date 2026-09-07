const BureauSubmission = require('../../models/budget/BureauSubmission');
const { handleGuardError } = require('../crudControllerFactory');
const {
  createBureauSubmission,
  submitBureauSubmission,
  acknowledgeBureauSubmission,
} = require('../../services/budgetService');

const controller = {
  async getAll(req, res, next) {
    try {
      const submissions = await BureauSubmission.find().populate('cycle');
      res.json(submissions);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const submission = await BureauSubmission.findById(req.params.id).populate('cycle');
      if (!submission) {
        return res.status(404).json({ message: 'Bureau submission not found.' });
      }
      res.json(submission);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-RPB-005: aggregate a cycle's approved requests into a submission.
  async create(req, res, next) {
    try {
      const { cycleId } = req.body;
      const submission = await createBureauSubmission(cycleId);
      res.status(201).json(submission);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async submit(req, res, next) {
    try {
      const submission = await submitBureauSubmission(req.params.id);
      res.json(submission);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async acknowledge(req, res, next) {
    try {
      const submission = await acknowledgeBureauSubmission(req.params.id);
      res.json(submission);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
