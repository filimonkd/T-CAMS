const PettyCashTransaction = require('../../models/finance/PettyCashTransaction');
const { handleGuardError } = require('../crudControllerFactory');
const {
  recordPettyCashTransaction,
  voidPettyCashTransaction,
} = require('../../services/financeService');

/**
 * Transactions are only created/voided through the guarded financeService
 * workflow so the fund-balance check can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const transactions = await PettyCashTransaction.find().populate('pettyCashFund');
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const transaction = await PettyCashTransaction.findById(req.params.id).populate('pettyCashFund');
      if (!transaction) {
        return res.status(404).json({ message: 'Petty cash transaction not found.' });
      }
      res.json(transaction);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-FIN-007: Record Petty Cash Transaction.
  async create(req, res, next) {
    try {
      const { fundId, amount, purpose } = req.body;
      const transaction = await recordPettyCashTransaction(fundId, amount, purpose);
      res.status(201).json(transaction);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async void(req, res, next) {
    try {
      const transaction = await voidPettyCashTransaction(req.params.id);
      res.json(transaction);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
