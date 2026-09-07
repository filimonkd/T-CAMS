const RecruitmentRequisition = require('../models/hr/RecruitmentRequisition');
const JobApplication = require('../models/hr/JobApplication');
const EmploymentContract = require('../models/hr/EmploymentContract');
const LeaveRequest = require('../models/hr/LeaveRequest');
const MedicalClearance = require('../models/hr/MedicalClearance');
const PropertyClearance = require('../models/hr/PropertyClearance');
const TrainingEnrollment = require('../models/hr/TrainingEnrollment');
const BiometricEnrollment = require('../models/hr/BiometricEnrollment');
const LeaveBalance = require('../models/supporting/LeaveBalance');
const {
  ensureExists,
  transitionStatus,
  assertLeaveBalance,
  assertNoActiveClearanceHold,
  assertBiometricUnique,
  assertContractPrerequisite,
} = require('./guardService');

async function countPendingClearances(employeeName) {
  const [pendingMedical, pendingProperty] = await Promise.all([
    MedicalClearance.countDocuments({ employeeName, status: 'PENDING' }),
    PropertyClearance.countDocuments({ employeeName, status: 'PENDING' }),
  ]);
  return pendingMedical + pendingProperty;
}

// --- RecruitmentRequisition (UC-ADMIN-HR-001) ---

async function approveRecruitmentRequisition(requisitionId) {
  const requisition = await RecruitmentRequisition.findById(requisitionId);
  ensureExists(requisition, 'Recruitment requisition');
  transitionStatus(requisition, 'status', ['REQUESTED'], 'APPROVED');
  await requisition.save();
  return requisition;
}

async function closeRecruitmentRequisition(requisitionId) {
  const requisition = await RecruitmentRequisition.findById(requisitionId);
  ensureExists(requisition, 'Recruitment requisition');
  transitionStatus(requisition, 'status', ['APPROVED'], 'CLOSED');
  await requisition.save();
  return requisition;
}

async function rejectRecruitmentRequisition(requisitionId) {
  const requisition = await RecruitmentRequisition.findById(requisitionId);
  ensureExists(requisition, 'Recruitment requisition');
  transitionStatus(requisition, 'status', ['REQUESTED'], 'REJECTED');
  await requisition.save();
  return requisition;
}

// --- JobApplication (UC-ADMIN-HR-002) ---

async function shortlistJobApplication(applicationId) {
  const application = await JobApplication.findById(applicationId);
  ensureExists(application, 'Job application');
  transitionStatus(application, 'status', ['SUBMITTED'], 'SHORTLISTED');
  await application.save();
  return application;
}

async function rejectJobApplication(applicationId) {
  const application = await JobApplication.findById(applicationId);
  ensureExists(application, 'Job application');
  transitionStatus(application, 'status', ['SUBMITTED', 'SHORTLISTED'], 'REJECTED');
  await application.save();
  return application;
}

async function hireJobApplication(applicationId) {
  const application = await JobApplication.findById(applicationId);
  ensureExists(application, 'Job application');
  transitionStatus(application, 'status', ['SHORTLISTED'], 'HIRED');
  await application.save();
  return application;
}

// --- EmploymentContract (UC-ADMIN-HR-003) ---

async function signEmploymentContract(contractId) {
  const contract = await EmploymentContract.findById(contractId);
  ensureExists(contract, 'Employment contract');
  transitionStatus(contract, 'status', ['DRAFT'], 'SIGNED');
  await contract.save();
  return contract;
}

async function activateEmploymentContract(contractId) {
  const contract = await EmploymentContract.findById(contractId);
  ensureExists(contract, 'Employment contract');
  transitionStatus(contract, 'status', ['SIGNED'], 'ACTIVE');
  await contract.save();
  return contract;
}

async function terminateEmploymentContract(contractId) {
  const contract = await EmploymentContract.findById(contractId);
  ensureExists(contract, 'Employment contract');
  transitionStatus(contract, 'status', ['ACTIVE'], 'TERMINATED');
  await contract.save();
  return contract;
}

// --- LeaveRequest (UC-ADMIN-HR-004) ---

// Blocked by insufficient leave balance or a pending medical/property clearance.
async function submitLeaveRequest(leaveBalanceId, requestedDays, startDate, endDate, reason) {
  const leaveBalance = await LeaveBalance.findById(leaveBalanceId);
  assertLeaveBalance(leaveBalance, requestedDays);

  const pendingClearances = await countPendingClearances(leaveBalance.employeeName);
  assertNoActiveClearanceHold(pendingClearances, leaveBalance.employeeName);

  return LeaveRequest.create({ leaveBalance: leaveBalanceId, requestedDays, startDate, endDate, reason });
}

async function approveLeaveRequest(requestId) {
  const request = await LeaveRequest.findById(requestId);
  ensureExists(request, 'Leave request');

  const leaveBalance = await LeaveBalance.findById(request.leaveBalance);
  assertLeaveBalance(leaveBalance, request.requestedDays);

  transitionStatus(request, 'status', ['SUBMITTED'], 'APPROVED');
  await request.save();

  leaveBalance.usedDays += request.requestedDays;
  await leaveBalance.save();

  return request;
}

async function rejectLeaveRequest(requestId) {
  const request = await LeaveRequest.findById(requestId);
  ensureExists(request, 'Leave request');
  transitionStatus(request, 'status', ['SUBMITTED'], 'REJECTED');
  await request.save();
  return request;
}

// --- MedicalClearance (UC-ADMIN-HR-005) ---

async function clearMedicalClearance(clearanceId) {
  const clearance = await MedicalClearance.findById(clearanceId);
  ensureExists(clearance, 'Medical clearance');
  transitionStatus(clearance, 'status', ['PENDING'], 'CLEARED');
  await clearance.save();
  return clearance;
}

async function rejectMedicalClearance(clearanceId) {
  const clearance = await MedicalClearance.findById(clearanceId);
  ensureExists(clearance, 'Medical clearance');
  transitionStatus(clearance, 'status', ['PENDING'], 'REJECTED');
  await clearance.save();
  return clearance;
}

// --- PropertyClearance (UC-ADMIN-HR-006) ---

async function clearPropertyClearance(clearanceId) {
  const clearance = await PropertyClearance.findById(clearanceId);
  ensureExists(clearance, 'Property clearance');
  transitionStatus(clearance, 'status', ['PENDING'], 'CLEARED');
  await clearance.save();
  return clearance;
}

async function rejectPropertyClearance(clearanceId) {
  const clearance = await PropertyClearance.findById(clearanceId);
  ensureExists(clearance, 'Property clearance');
  transitionStatus(clearance, 'status', ['PENDING'], 'REJECTED');
  await clearance.save();
  return clearance;
}

// --- TrainingEnrollment (UC-ADMIN-HR-007) ---

// Blocked without an active, signed EmploymentContract, or a pending clearance.
async function enrollInTraining(employeeName, trainingScheduleId) {
  const contract = await EmploymentContract.findOne({ employeeName, status: 'ACTIVE' });
  assertContractPrerequisite(contract);

  const pendingClearances = await countPendingClearances(employeeName);
  assertNoActiveClearanceHold(pendingClearances, employeeName);

  return TrainingEnrollment.create({ employeeName, trainingSchedule: trainingScheduleId });
}

async function completeTrainingEnrollment(enrollmentId) {
  const enrollment = await TrainingEnrollment.findById(enrollmentId);
  ensureExists(enrollment, 'Training enrollment');
  transitionStatus(enrollment, 'status', ['ENROLLED'], 'COMPLETED');
  await enrollment.save();
  return enrollment;
}

async function cancelTrainingEnrollment(enrollmentId) {
  const enrollment = await TrainingEnrollment.findById(enrollmentId);
  ensureExists(enrollment, 'Training enrollment');
  transitionStatus(enrollment, 'status', ['ENROLLED'], 'CANCELLED');
  await enrollment.save();
  return enrollment;
}

// --- BiometricEnrollment (UC-ADMIN-HR-008) ---

// Blocked if the biometric hash already belongs to another active employee.
async function enrollBiometric(employeeName, biometricHash) {
  const existing = await BiometricEnrollment.findOne({ biometricHash, status: 'ACTIVE' });
  assertBiometricUnique(existing);

  return BiometricEnrollment.create({ employeeName, biometricHash });
}

async function revokeBiometricEnrollment(enrollmentId) {
  const enrollment = await BiometricEnrollment.findById(enrollmentId);
  ensureExists(enrollment, 'Biometric enrollment');
  transitionStatus(enrollment, 'status', ['ACTIVE'], 'REVOKED');
  await enrollment.save();
  return enrollment;
}

module.exports = {
  approveRecruitmentRequisition,
  closeRecruitmentRequisition,
  rejectRecruitmentRequisition,
  shortlistJobApplication,
  rejectJobApplication,
  hireJobApplication,
  signEmploymentContract,
  activateEmploymentContract,
  terminateEmploymentContract,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  clearMedicalClearance,
  rejectMedicalClearance,
  clearPropertyClearance,
  rejectPropertyClearance,
  enrollInTraining,
  completeTrainingEnrollment,
  cancelTrainingEnrollment,
  enrollBiometric,
  revokeBiometricEnrollment,
};
