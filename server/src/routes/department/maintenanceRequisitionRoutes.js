const express = require('express');
const controller = require('../../controllers/department/maintenanceRequisitionController');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/approve', controller.approve);
router.post('/:id/complete', controller.complete);

module.exports = router;
