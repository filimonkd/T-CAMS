const controller = require('../../controllers/supporting/stockItemController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/issue', controller.issue);

module.exports = router;
