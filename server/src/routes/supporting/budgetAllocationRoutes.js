const controller = require('../../controllers/supporting/budgetAllocationController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
