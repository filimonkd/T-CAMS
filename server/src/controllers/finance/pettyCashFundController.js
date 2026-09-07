const PettyCashFund = require('../../models/finance/PettyCashFund');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(PettyCashFund);
