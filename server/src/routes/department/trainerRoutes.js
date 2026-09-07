const controller = require('../../controllers/department/trainerController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
