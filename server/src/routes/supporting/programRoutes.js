const controller = require('../../controllers/supporting/programController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/approve', controller.approve);

module.exports = router;
