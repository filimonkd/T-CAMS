const StockItem = require('../../models/supporting/StockItem');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensureSufficientStock } = require('../../services/guardService');

const controller = createCrudController(StockItem);

// PROC-006: Issue Stock Item to Department (blocked if insufficient stock).
controller.issue = async function issue(req, res, next) {
  try {
    const { quantity } = req.body;
    const stockItem = await StockItem.findById(req.params.id);
    ensureSufficientStock(stockItem, quantity);

    stockItem.quantityOnHand -= quantity;
    await stockItem.save();
    res.json(stockItem);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
