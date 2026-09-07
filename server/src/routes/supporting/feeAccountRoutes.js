const controller = require('../../controllers/supporting/feeAccountController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
