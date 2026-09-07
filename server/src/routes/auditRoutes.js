const express = require('express');
const controller = require('../controllers/auditController');

const router = express.Router();

// Static route registered before the dynamic :entityType/:entityId pattern below.
router.get('/compliance', controller.getComplianceLog);
router.get('/:entityType/:entityId', controller.getEntityHistory);

module.exports = router;
