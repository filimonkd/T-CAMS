const express = require('express');
const controller = require('../../controllers/hr/biometricEnrollmentController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/revoke', controller.revoke);

module.exports = router;
