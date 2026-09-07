const express = require('express');

const router = express.Router();

router.use('/vendors', require('./supporting/vendorRoutes'));
router.use('/stock-items', require('./supporting/stockItemRoutes'));
router.use('/budget-allocations', require('./supporting/budgetAllocationRoutes'));
router.use('/programs', require('./supporting/programRoutes'));
router.use('/courses', require('./supporting/courseRoutes'));
router.use('/sections', require('./supporting/sectionRoutes'));
router.use('/leave-balances', require('./supporting/leaveBalanceRoutes'));
router.use('/asset-assignments', require('./supporting/assetAssignmentRoutes'));
router.use('/fee-accounts', require('./supporting/feeAccountRoutes'));
router.use('/rooms', require('./supporting/roomRoutes'));
router.use('/learners', require('./registrar/learnerRoutes'));
router.use('/enrollments', require('./registrar/enrollmentRoutes'));

module.exports = router;
