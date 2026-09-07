const controller = require('../../controllers/supporting/courseController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/retire', controller.retire);

module.exports = router;
