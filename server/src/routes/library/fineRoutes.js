const express = require('express');
const controller = require('../../controllers/library/fineController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/pay', controller.pay);
router.post('/:id/waive', controller.waive);

module.exports = router;
