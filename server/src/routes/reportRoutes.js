const express = require('express');
const controller = require('../controllers/reportController');

const router = express.Router();

router.get('/qualifications/:enrollmentId', controller.qualification);
router.get('/library-overdue', controller.libraryOverdue);
router.get('/budget-reports/:reportType/:reportId', controller.budgetReport);

module.exports = router;
