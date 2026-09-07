const controller = require('../../controllers/supporting/vendorController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
