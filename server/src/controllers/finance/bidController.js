const Bid = require('../../models/finance/Bid');
const { handleGuardError } = require('../crudControllerFactory');
const { submitBid } = require('../../services/financeService');

const controller = {
  async getAll(req, res, next) {
    try {
      const bids = await Bid.find().populate('vendor');
      res.json(bids);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const bid = await Bid.findById(req.params.id).populate('vendor');
      if (!bid) {
        return res.status(404).json({ message: 'Bid not found.' });
      }
      res.json(bid);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { vendorId, description, amount } = req.body;
      const bid = await submitBid(vendorId, description, amount);
      res.status(201).json(bid);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
