const BudgetAllocation = require('../../models/supporting/BudgetAllocation');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(BudgetAllocation);
