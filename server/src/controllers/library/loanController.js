const Loan = require('../../models/library/Loan');
const { handleGuardError } = require('../crudControllerFactory');
const { issueLoan, returnLoan } = require('../../services/libraryService');

/**
 * Loans are only created/closed through the guarded libraryService workflow
 * (issue/return) so overdue and book-condition checks can never be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const loans = await Loan.find().populate('book').populate('learner');
      res.json(loans);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const loan = await Loan.findById(req.params.id).populate('book').populate('learner');
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found.' });
      }
      res.json(loan);
    } catch (err) {
      next(err);
    }
  },

  // LIB-003: Issue Loan.
  async create(req, res, next) {
    try {
      const { bookId, learnerId } = req.body;
      const loan = await issueLoan(bookId, learnerId);
      res.status(201).json(loan);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  // LIB-003 (UC-900-02-02): Return Loan, auto-calculating a Fine if overdue.
  async returnLoan(req, res, next) {
    try {
      const result = await returnLoan(req.params.id);
      res.json(result);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
