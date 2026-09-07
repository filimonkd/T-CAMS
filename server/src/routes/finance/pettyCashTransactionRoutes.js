const express = require('express');
const controller = require('../../controllers/finance/pettyCashTransactionController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/void', controller.void);

module.exports = router;
