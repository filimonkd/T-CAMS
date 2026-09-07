const controller = require('../../controllers/hr/employmentContractController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/sign', controller.sign);
router.post('/:id/activate', controller.activate);
router.post('/:id/terminate', controller.terminate);

module.exports = router;
