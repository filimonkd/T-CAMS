const controller = require('../../controllers/supporting/roomController');
const { createCrudRouter } = require('../crudRouterFactory');

const router = createCrudRouter(controller);
router.post('/:id/book', controller.book);
router.post('/:id/release', controller.release);

module.exports = router;
