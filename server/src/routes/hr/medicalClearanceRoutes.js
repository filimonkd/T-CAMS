const controller = require('../../controllers/hr/medicalClearanceController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/clear', controller.clear);
router.post('/:id/reject', controller.reject);

module.exports = router;
