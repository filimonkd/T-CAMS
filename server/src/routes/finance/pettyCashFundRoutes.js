const controller = require('../../controllers/finance/pettyCashFundController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
