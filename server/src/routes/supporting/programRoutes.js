const controller = require('../../controllers/supporting/programController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
