const controller = require('../../controllers/supporting/assetAssignmentController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
