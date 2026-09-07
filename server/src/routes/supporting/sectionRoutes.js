const controller = require('../../controllers/supporting/sectionController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/capacity', controller.setCapacity);
router.post('/:id/close', controller.close);

module.exports = router;
