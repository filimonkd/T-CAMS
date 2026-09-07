const controller = require('../../controllers/supporting/courseController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
