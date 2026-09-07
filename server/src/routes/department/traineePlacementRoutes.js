const express = require('express');
const controller = require('../../controllers/department/traineePlacementController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/withdraw', controller.withdraw);

module.exports = router;
