const controller = require('../../controllers/budget/budgetRequestCycleController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/close', controller.close);

module.exports = router;
