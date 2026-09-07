const { handleGuardError } = require('./crudControllerFactory');
const { advanceReport, rejectReport } = require('../services/approvalChainService');

/**
 * Builds a controller for a shared "chain report" entity (MonthlyBudgetReport,
 * AnnualBudgetPlan) that is defined once but driven through one of two
 * variant approval chains. `defaultChain` lets the RPB and Finance route
 * entry points create the same underlying document type with their own
 * chain by default (the caller may still override it in the request body).
 */
function createReportController(Model, defaultChain) {
  return {
    async create(req, res, next) {
      try {
        const doc = await Model.create({ ...req.body, approvalChain: req.body.approvalChain || defaultChain });
        res.status(201).json(doc);
      } catch (err) {
        handleGuardError(err, res, next);
      }
    },

    async getAll(req, res, next) {
      try {
        const docs = await Model.find();
        res.json(docs);
      } catch (err) {
        next(err);
      }
    },

    async getById(req, res, next) {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) {
          return res.status(404).json({ message: `${Model.modelName} not found.` });
        }
        res.json(doc);
      } catch (err) {
        next(err);
      }
    },

    async advance(req, res, next) {
      try {
        const doc = await advanceReport(Model, req.params.id);
        res.json(doc);
      } catch (err) {
        handleGuardError(err, res, next);
      }
    },

    async reject(req, res, next) {
      try {
        const doc = await rejectReport(Model, req.params.id);
        res.json(doc);
      } catch (err) {
        handleGuardError(err, res, next);
      }
    },
  };
}

module.exports = { createReportController };
