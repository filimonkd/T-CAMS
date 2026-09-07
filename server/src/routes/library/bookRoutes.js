const controller = require('../../controllers/library/bookController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
