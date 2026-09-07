const express = require('express');
const controller = require('../../controllers/budget/bureauSubmissionController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/submit', controller.submit);
router.post('/:id/acknowledge', controller.acknowledge);

module.exports = router;
