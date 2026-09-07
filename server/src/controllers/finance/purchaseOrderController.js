const PurchaseOrder = require('../../models/finance/PurchaseOrder');
const { handleGuardError } = require('../crudControllerFactory');
const {
  issuePurchaseOrder,
  fulfillPurchaseOrder,
  cancelPurchaseOrder,
} = require('../../services/financeService');

/**
 * Orders are only created/fulfilled/cancelled through the guarded
 * financeService workflow so the vendor-approval check can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const orders = await PurchaseOrder.find().populate('vendor').populate('bid').populate('budgetAllocation');
      res.json(orders);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const order = await PurchaseOrder.findById(req.params.id)
        .populate('vendor')
        .populate('bid')
        .populate('budgetAllocation');
      if (!order) {
        return res.status(404).json({ message: 'Purchase order not found.' });
      }
      res.json(order);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-FIN-005: Issue Purchase Order.
  async create(req, res, next) {
    try {
      const { vendorId, bidId, budgetAllocationId, amount } = req.body;
      const order = await issuePurchaseOrder(vendorId, bidId, budgetAllocationId, amount);
      res.status(201).json(order);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async fulfill(req, res, next) {
    try {
      const order = await fulfillPurchaseOrder(req.params.id);
      res.json(order);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async cancel(req, res, next) {
    try {
      const order = await cancelPurchaseOrder(req.params.id);
      res.json(order);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
