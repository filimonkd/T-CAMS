const controller = require('../../controllers/supporting/sectionController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
