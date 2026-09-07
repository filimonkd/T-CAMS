const controller = require('../../controllers/hr/recruitmentRequisitionController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/approve', controller.approve);
router.post('/:id/close', controller.close);
router.post('/:id/reject', controller.reject);

module.exports = router;
