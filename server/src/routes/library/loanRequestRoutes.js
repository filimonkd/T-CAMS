const controller = require('../../controllers/library/loanRequestController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/approve', controller.approve);

module.exports = router;
