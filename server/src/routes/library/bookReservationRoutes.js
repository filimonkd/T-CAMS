const express = require('express');
const controller = require('../../controllers/library/bookReservationController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/cancel', controller.cancel);

module.exports = router;
