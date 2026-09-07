const controller = require('../../controllers/department/courseOutlineController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/approve', controller.approve);
router.post('/:id/archive', controller.archive);

module.exports = router;
