const BidEvaluation = require('../../models/finance/BidEvaluation');
const { handleGuardError } = require('../crudControllerFactory');
const {
  createBidEvaluation,
  finalizeBidEvaluation,
  rejectBidEvaluation,
} = require('../../services/financeService');

/**
 * Evaluations are only created/finalized/rejected through the guarded
 * financeService workflow so the vendor-approval and score-threshold checks
 * can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const evaluations = await BidEvaluation.find().populate('bid');
      res.json(evaluations);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const evaluation = await BidEvaluation.findById(req.params.id).populate('bid');
      if (!evaluation) {
        return res.status(404).json({ message: 'Bid evaluation not found.' });
      }
      res.json(evaluation);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-FIN-003: Create Bid Evaluation.
  async create(req, res, next) {
    try {
      const { bidId, score, evaluatorNotes } = req.body;
      const evaluation = await createBidEvaluation(bidId, score, evaluatorNotes);
      res.status(201).json(evaluation);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  // UC-ADMIN-FIN-004: Finalize Bid Evaluation.
  async finalize(req, res, next) {
    try {
      const evaluation = await finalizeBidEvaluation(req.params.id);
      res.json(evaluation);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async reject(req, res, next) {
    try {
      const evaluation = await rejectBidEvaluation(req.params.id);
      res.json(evaluation);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
