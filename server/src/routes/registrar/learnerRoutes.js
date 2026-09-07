const controller = require('../../controllers/registrar/learnerController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
