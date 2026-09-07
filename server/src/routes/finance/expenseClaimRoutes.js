const express = require('express');
const controller = require('../../controllers/finance/expenseClaimController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/approve', controller.approve);
router.post('/:id/reject', controller.reject);

module.exports = router;
