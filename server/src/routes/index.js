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
router.use('/library/books', require('./library/bookRoutes'));
router.use('/library/loan-requests', require('./library/loanRequestRoutes'));
router.use('/library/loans', require('./library/loanRoutes'));
router.use('/library/reservations', require('./library/bookReservationRoutes'));
router.use('/library/binding-requests', require('./library/bindingRequestRoutes'));
router.use('/library/fines', require('./library/fineRoutes'));
router.use('/library/reports', require('./library/reportRoutes'));
router.use('/department/trainers', require('./department/trainerRoutes'));
router.use('/department/trainee-placements', require('./department/traineePlacementRoutes'));
router.use('/department/training-schedules', require('./department/trainingScheduleRoutes'));
router.use('/department/material-requests', require('./department/materialRequestRoutes'));
router.use('/department/course-outlines', require('./department/courseOutlineRoutes'));
router.use('/department/maintenance-requisitions', require('./department/maintenanceRequisitionRoutes'));
router.use('/department/attendance-records', require('./department/attendanceRecordRoutes'));
router.use('/department/exam-room-assignments', require('./department/examRoomAssignmentRoutes'));

module.exports = router;
