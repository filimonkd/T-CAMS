const Fine = require('../../models/library/Fine');
const { handleGuardError } = require('../crudControllerFactory');
const { payFine, waiveFine } = require('../../services/libraryService');

/**
 * Fines are auto-created by libraryService.returnLoan; this controller only
 * exposes reading them and moving them to PAID/WAIVED.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const fines = await Fine.find().populate('loan').populate('learner');
      res.json(fines);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const fine = await Fine.findById(req.params.id).populate('loan').populate('learner');
      if (!fine) {
        return res.status(404).json({ message: 'Fine not found.' });
      }
      res.json(fine);
    } catch (err) {
      next(err);
    }
  },

  async pay(req, res, next) {
    try {
      const fine = await payFine(req.params.id);
      res.json(fine);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async waive(req, res, next) {
    try {
      const fine = await waiveFine(req.params.id);
      res.json(fine);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
