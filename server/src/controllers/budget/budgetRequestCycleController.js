const BudgetRequestCycle = require('../../models/budget/BudgetRequestCycle');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { closeBudgetRequestCycle } = require('../../services/budgetService');

const controller = createCrudController(BudgetRequestCycle);

controller.close = async function close(req, res, next) {
  try {
    const cycle = await closeBudgetRequestCycle(req.params.id);
    res.json(cycle);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
