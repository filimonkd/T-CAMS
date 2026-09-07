const controller = require('../../controllers/hr/jobApplicationController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/shortlist', controller.shortlist);
router.post('/:id/reject', controller.reject);
router.post('/:id/hire', controller.hire);

module.exports = router;
