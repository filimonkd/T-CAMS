const controller = require('../../controllers/supporting/leaveBalanceController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/approve', controller.approve);

module.exports = router;
