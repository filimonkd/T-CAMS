const express = require('express');
const controller = require('../../controllers/library/loanController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/return', controller.returnLoan);

module.exports = router;
