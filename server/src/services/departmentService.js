const Section = require('../models/supporting/Section');
const StockItem = require('../models/supporting/StockItem');
const BudgetAllocation = require('../models/supporting/BudgetAllocation');
const Room = require('../models/supporting/Room');
const Trainer = require('../models/department/Trainer');
const TraineePlacement = require('../models/department/TraineePlacement');
const TrainingSchedule = require('../models/department/TrainingSchedule');
const MaterialRequest = require('../models/department/MaterialRequest');
const MaintenanceRequisition = require('../models/department/MaintenanceRequisition');
const ExamRoomAssignment = require('../models/department/ExamRoomAssignment');
const {
  ensureExists,
  transitionStatus,
  assertSectionCapacity,
  assertTrainerLoad,
  assertStockAvailability,
  assertBudgetAvailable,
  assertRoomCapacity,
} = require('./guardService');

// UC-ADMIN-DEPT-001: Place Trainee into Section (blocked at section capacity).
async function placeTrainee(learnerId, sectionId) {
  const section = await Section.findById(sectionId);
  assertSectionCapacity(section);

  const placement = await TraineePlacement.create({ learner: learnerId, section: sectionId });
  section.enrolledCount += 1;
  await section.save();

  return placement;
}

async function withdrawTraineePlacement(placementId) {
  const placement = await TraineePlacement.findById(placementId);
  ensureExists(placement, 'Trainee placement');
  await transitionStatus(placement, 'status', ['PLACED'], 'WITHDRAWN');
  await placement.save();

  const section = await Section.findById(placement.section);
  ensureExists(section, 'Section');
  section.enrolledCount = Math.max(0, section.enrolledCount - 1);
  await section.save();

  return placement;
}

// UC-ADMIN-DEPT-002: Create Training Schedule (blocked over the trainer's contract hour limit).
async function scheduleTraining(trainerId, sectionId, scheduledDate, hours) {
  const trainer = await Trainer.findById(trainerId);
  assertTrainerLoad(trainer, hours);

  const schedule = await TrainingSchedule.create({ trainer: trainerId, section: sectionId, scheduledDate, hours });
  trainer.scheduledHours += hours;
  await trainer.save();

  return schedule;
}

async function cancelTrainingSchedule(scheduleId) {
  const schedule = await TrainingSchedule.findById(scheduleId);
  ensureExists(schedule, 'Training schedule');
  await transitionStatus(schedule, 'status', ['SCHEDULED'], 'CANCELLED');
  await schedule.save();

  const trainer = await Trainer.findById(schedule.trainer);
  ensureExists(trainer, 'Trainer');
  trainer.scheduledHours = Math.max(0, trainer.scheduledHours - schedule.hours);
  await trainer.save();

  return schedule;
}

// UC-ADMIN-DEPT-003: Submit Material Request (blocked on stock or budget).
async function submitMaterialRequest(stockItemId, budgetAllocationId, quantityRequested, estimatedCost) {
  const stockItem = await StockItem.findById(stockItemId);
  assertStockAvailability(stockItem, quantityRequested);

  const budgetAllocation = await BudgetAllocation.findById(budgetAllocationId);
  assertBudgetAvailable(budgetAllocation, estimatedCost);

  return MaterialRequest.create({
    stockItem: stockItemId,
    budgetAllocation: budgetAllocationId,
    quantityRequested,
    estimatedCost,
  });
}

// Approving a material request commits the stock deduction and budget spend together.
async function approveMaterialRequest(requestId) {
  const request = await MaterialRequest.findById(requestId);
  ensureExists(request, 'Material request');

  const stockItem = await StockItem.findById(request.stockItem);
  assertStockAvailability(stockItem, request.quantityRequested);

  const budgetAllocation = await BudgetAllocation.findById(request.budgetAllocation);
  assertBudgetAvailable(budgetAllocation, request.estimatedCost);

  await transitionStatus(request, 'status', ['REQUESTED'], 'APPROVED', 'UC-ADMIN-DEPT-003');
  await request.save();

  stockItem.quantityOnHand -= request.quantityRequested;
  await stockItem.save();

  budgetAllocation.spentAmount += request.estimatedCost;
  await budgetAllocation.save();

  return request;
}

async function rejectMaterialRequest(requestId) {
  const request = await MaterialRequest.findById(requestId);
  ensureExists(request, 'Material request');
  await transitionStatus(request, 'status', ['REQUESTED'], 'REJECTED', 'UC-ADMIN-DEPT-003');
  await request.save();
  return request;
}

// UC-ADMIN-DEPT-005: Submit Maintenance Requisition (blocked on budget).
async function submitMaintenanceRequisition(roomId, budgetAllocationId, description, estimatedCost) {
  const room = await Room.findById(roomId);
  ensureExists(room, 'Room');

  const budgetAllocation = await BudgetAllocation.findById(budgetAllocationId);
  assertBudgetAvailable(budgetAllocation, estimatedCost);

  return MaintenanceRequisition.create({
    room: roomId,
    budgetAllocation: budgetAllocationId,
    description,
    estimatedCost,
  });
}

async function approveMaintenanceRequisition(requisitionId) {
  const requisition = await MaintenanceRequisition.findById(requisitionId);
  ensureExists(requisition, 'Maintenance requisition');

  const budgetAllocation = await BudgetAllocation.findById(requisition.budgetAllocation);
  assertBudgetAvailable(budgetAllocation, requisition.estimatedCost);

  await transitionStatus(requisition, 'status', ['REQUESTED'], 'APPROVED', 'UC-ADMIN-DEPT-005');
  await requisition.save();

  budgetAllocation.spentAmount += requisition.estimatedCost;
  await budgetAllocation.save();

  const room = await Room.findById(requisition.room);
  ensureExists(room, 'Room');
  await transitionStatus(room, 'status', ['AVAILABLE'], 'MAINTENANCE', 'UC-ADMIN-DEPT-005');
  await room.save();

  return requisition;
}

async function completeMaintenanceRequisition(requisitionId) {
  const requisition = await MaintenanceRequisition.findById(requisitionId);
  ensureExists(requisition, 'Maintenance requisition');
  await transitionStatus(requisition, 'status', ['APPROVED'], 'COMPLETED', 'UC-ADMIN-DEPT-005');
  requisition.completedAt = new Date();
  await requisition.save();

  const room = await Room.findById(requisition.room);
  ensureExists(room, 'Room');
  await transitionStatus(room, 'status', ['MAINTENANCE'], 'AVAILABLE', 'UC-ADMIN-DEPT-005');
  await room.save();

  return requisition;
}

// UC-ADMIN-DEPT-007: Assign Exam Room (blocked if the cohort exceeds room capacity).
async function assignExamRoom(sectionId, roomId, examDate, cohortSize) {
  const room = await Room.findById(roomId);
  assertRoomCapacity(room, cohortSize);

  return ExamRoomAssignment.create({ section: sectionId, room: roomId, examDate, cohortSize });
}

async function cancelExamRoomAssignment(assignmentId) {
  const assignment = await ExamRoomAssignment.findById(assignmentId);
  ensureExists(assignment, 'Exam room assignment');
  await transitionStatus(assignment, 'status', ['ASSIGNED'], 'CANCELLED');
  await assignment.save();
  return assignment;
}

module.exports = {
  placeTrainee,
  withdrawTraineePlacement,
  scheduleTraining,
  cancelTrainingSchedule,
  submitMaterialRequest,
  approveMaterialRequest,
  rejectMaterialRequest,
  submitMaintenanceRequisition,
  approveMaintenanceRequisition,
  completeMaintenanceRequisition,
  assignExamRoom,
  cancelExamRoomAssignment,
};
