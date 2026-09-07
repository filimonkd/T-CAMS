/**
 * Comprehensive, idempotent seed script for T-CAMS (Phase 10). Populates:
 *   - Roles and one demo User per role (see README.md for login credentials)
 *   - Supporting data every guard needs real records to evaluate against
 *   - One representative, guard-driven sample workflow per major module,
 *     each pushed through the real service functions (not raw Model.create
 *     with a hardcoded status) so genuine AuditLog entries exist for the
 *     approval-history timeline in the UI
 *
 * Safe to re-run: existing documents are matched by their natural key and
 * left untouched, so running `npm run seed` twice does not duplicate data
 * or re-trigger already-completed workflows.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

const { connectDB } = require('../server/src/config/db');
const Role = require('../server/src/models/Role');
const User = require('../server/src/models/User');
const { hashPassword } = require('../server/src/services/authService');

const Vendor = require('../server/src/models/supporting/Vendor');
const Program = require('../server/src/models/supporting/Program');
const Course = require('../server/src/models/supporting/Course');
const Room = require('../server/src/models/supporting/Room');
const Section = require('../server/src/models/supporting/Section');
const BudgetAllocation = require('../server/src/models/supporting/BudgetAllocation');
const StockItem = require('../server/src/models/supporting/StockItem');
const LeaveBalance = require('../server/src/models/supporting/LeaveBalance');

const Learner = require('../server/src/models/registrar/Learner');
const Enrollment = require('../server/src/models/registrar/Enrollment');
const { enrollLearner } = require('../server/src/services/registrarService');

const Book = require('../server/src/models/library/Book');
const LoanRequest = require('../server/src/models/library/LoanRequest');
const Loan = require('../server/src/models/library/Loan');
const { addBookToCatalog, issueLoan, returnLoan } = require('../server/src/services/libraryService');

const Trainer = require('../server/src/models/department/Trainer');
const TrainingSchedule = require('../server/src/models/department/TrainingSchedule');
const { scheduleTraining } = require('../server/src/services/departmentService');

const BudgetRequestCycle = require('../server/src/models/budget/BudgetRequestCycle');
const DepartmentBudgetRequest = require('../server/src/models/budget/DepartmentBudgetRequest');
const MonthlyBudgetReport = require('../server/src/models/budget/MonthlyBudgetReport');
const { submitDepartmentBudgetRequest, approveDepartmentBudgetRequest } = require('../server/src/services/budgetService');
const { advanceReport } = require('../server/src/services/approvalChainService');

const Bid = require('../server/src/models/finance/Bid');
const BidEvaluation = require('../server/src/models/finance/BidEvaluation');
const PurchaseOrder = require('../server/src/models/finance/PurchaseOrder');
const { submitBid, createBidEvaluation, finalizeBidEvaluation, issuePurchaseOrder } = require('../server/src/services/financeService');

const RecruitmentRequisition = require('../server/src/models/hr/RecruitmentRequisition');
const JobApplication = require('../server/src/models/hr/JobApplication');
const EmploymentContract = require('../server/src/models/hr/EmploymentContract');
const LeaveRequest = require('../server/src/models/hr/LeaveRequest');
const MedicalClearance = require('../server/src/models/hr/MedicalClearance');
const TrainingEnrollment = require('../server/src/models/hr/TrainingEnrollment');
const {
  approveRecruitmentRequisition,
  shortlistJobApplication,
  signEmploymentContract,
  activateEmploymentContract,
  submitLeaveRequest,
  approveLeaveRequest,
  enrollInTraining,
} = require('../server/src/services/hrService');

const DEMO_PASSWORD = 'Password123!';

const ROLES = [
  { name: 'ADMIN', description: 'Full system access', permissions: ['*'] },
  { name: 'REGISTRAR', description: 'Manages programs, courses, sections and enrollment', permissions: ['ACADEMIC:*'] },
  { name: 'PROCUREMENT_OFFICER', description: 'Manages vendors, stock and budget allocations', permissions: ['PROCUREMENT:*'] },
  { name: 'HR_OFFICER', description: 'Manages staff leave, recruitment and HR clearances', permissions: ['HR:*'] },
  { name: 'FINANCE_OFFICER', description: 'Manages fee accounts, bids, purchase orders and expense claims', permissions: ['FINANCE:*'] },
  { name: 'AUDITOR', description: 'Read-only access for internal audits and QMS records', permissions: ['QMS:READ', 'AUDIT:READ'] },
  { name: 'LIBRARY_OFFICER', description: 'Manages the library catalog, loans and reservations', permissions: ['LIBRARY:*'] },
  { name: 'DEPARTMENT_HEAD', description: 'Manages trainers, schedules and department requisitions', permissions: ['DEPARTMENT:*'] },
  { name: 'BUDGET_OFFICER', description: 'Manages RPB budget cycles, requests and reports', permissions: ['BUDGET_RPB:*'] },
  { name: 'ADVISOR', description: 'Read access to academic records for advising', permissions: ['ACADEMIC:READ'] },
];

const DEMO_USERS = [
  { name: 'Super Admin', email: 'admin@tcams.local', role: 'ADMIN' },
  { name: 'Registrar Officer', email: 'registrar@tcams.local', role: 'REGISTRAR' },
  { name: 'Procurement Officer', email: 'procurement@tcams.local', role: 'PROCUREMENT_OFFICER' },
  { name: 'HR Officer', email: 'hr@tcams.local', role: 'HR_OFFICER' },
  { name: 'Finance Officer', email: 'finance@tcams.local', role: 'FINANCE_OFFICER' },
  { name: 'Auditor', email: 'auditor@tcams.local', role: 'AUDITOR' },
  { name: 'Library Officer', email: 'library@tcams.local', role: 'LIBRARY_OFFICER' },
  { name: 'Department Head', email: 'department@tcams.local', role: 'DEPARTMENT_HEAD' },
  { name: 'Budget Officer', email: 'budget@tcams.local', role: 'BUDGET_OFFICER' },
  { name: 'Advisor', email: 'advisor@tcams.local', role: 'ADVISOR' },
];

async function seedRoles() {
  for (const role of ROLES) {
    await Role.findOneAndUpdate({ name: role.name }, role, { upsert: true, new: true });
  }
  console.log(`Seeded ${ROLES.length} roles.`);
}

async function seedUsers() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  for (const demoUser of DEMO_USERS) {
    const existing = await User.findOne({ email: demoUser.email });
    if (!existing) {
      await User.create({ ...demoUser, passwordHash });
    }
  }
  console.log(`Seeded ${DEMO_USERS.length} users (password for all: "${DEMO_PASSWORD}").`);
}

async function seedSupportingData() {
  let vendor = await Vendor.findOne({ name: 'Acme Training Supplies' });
  if (!vendor) {
    vendor = await Vendor.create({
      name: 'Acme Training Supplies',
      contactEmail: 'sales@acmetraining.example',
      status: 'APPROVED',
    });
  }

  let program = await Program.findOne({ name: 'General Foundations Program' });
  if (!program) {
    program = await Program.create({
      name: 'General Foundations Program',
      description: 'Baseline program used to validate the Phase 2 foundation.',
      status: 'ACTIVE',
    });
  }

  let course = await Course.findOne({ title: 'Orientation', program: program._id });
  if (!course) {
    course = await Course.create({ program: program._id, title: 'Orientation', credits: 1 });
  }

  let room = await Room.findOne({ name: 'Room 101' });
  if (!room) {
    room = await Room.create({ name: 'Room 101', building: 'Main Building', capacity: 30 });
  }

  let healthyBudget = await BudgetAllocation.findOne({ department: 'General Operations', fiscalYear: '2026' });
  if (!healthyBudget) {
    healthyBudget = await BudgetAllocation.create({
      department: 'General Operations',
      fiscalYear: '2026',
      allocatedAmount: 100000,
      status: 'APPROVED',
    });
  }

  // Deliberately near-exhausted so a demo ExpenseClaim/MaterialRequest
  // submitted against it live in the UI is blocked by assertBudgetAvailable
  // - a concrete way to see that guard actually run against real data.
  let tightBudget = await BudgetAllocation.findOne({ department: 'Tight Demo Budget', fiscalYear: '2026' });
  if (!tightBudget) {
    tightBudget = await BudgetAllocation.create({
      department: 'Tight Demo Budget',
      fiscalYear: '2026',
      allocatedAmount: 500,
      spentAmount: 480,
      status: 'APPROVED',
    });
  }

  let stockItem = await StockItem.findOne({ name: 'Whiteboard Markers' });
  if (!stockItem) {
    stockItem = await StockItem.create({
      name: 'Whiteboard Markers',
      category: 'Office Supplies',
      quantityOnHand: 40,
      reorderLevel: 10,
      vendor: vendor._id,
    });
  }

  let leaveBalance = await LeaveBalance.findOne({ employeeName: 'Jane HR Sample', year: 2026 });
  if (!leaveBalance) {
    leaveBalance = await LeaveBalance.create({
      employeeName: 'Jane HR Sample',
      leaveType: 'ANNUAL',
      year: 2026,
      entitledDays: 20,
    });
  }

  console.log('Seeded supporting data (vendor, program, course, room, budgets, stock item, leave balance).');
  return { vendor, program, course, room, healthyBudget, tightBudget, stockItem, leaveBalance };
}

async function seedRegistrarData(course) {
  let section = await Section.findOne({ course: course._id, term: '2026-T1' });
  if (!section) {
    section = await Section.create({ course: course._id, term: '2026-T1', capacity: 25 });
  }

  let learner = await Learner.findOne({ email: 'sample.learner@example.com' });
  if (!learner) {
    learner = await Learner.create({
      firstName: 'Sample',
      lastName: 'Learner',
      email: 'sample.learner@example.com',
    });
  }

  const alreadyEnrolled = await Enrollment.findOne({ learner: learner._id, section: section._id, status: 'ENROLLED' });
  if (!alreadyEnrolled) {
    await enrollLearner(learner._id, section._id);
  }

  console.log('Seeded registrar data (section, learner, enrollment).');
  return { section, learner };
}

// UC-LIB-900/901/902: a book with a pending loan request, and a second book
// on an already-overdue loan that gets returned here so a real Fine and a
// full audit trail exist to look at immediately.
async function seedLibraryData(learner) {
  let bookA = await Book.findOne({ catalogId: 'CAT-0001' });
  if (!bookA) {
    bookA = await addBookToCatalog({ catalogId: 'CAT-0001', title: 'Introduction to ISO 9001', author: 'J. Smith' });
  }

  let loanRequest = await LoanRequest.findOne({ book: bookA._id, learner: learner._id });
  if (!loanRequest) {
    loanRequest = await LoanRequest.create({ book: bookA._id, learner: learner._id });
  }

  let bookB = await Book.findOne({ catalogId: 'CAT-0002' });
  if (!bookB) {
    bookB = await addBookToCatalog({ catalogId: 'CAT-0002', title: 'Quality Management Fundamentals', author: 'R. Doe' });
  }

  const existingLoan = await Loan.findOne({ book: bookB._id, learner: learner._id });
  if (!existingLoan) {
    const loan = await issueLoan(bookB._id, learner._id);

    const issuedAt = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const dueAt = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    await Loan.findByIdAndUpdate(loan._id, { issuedAt, dueAt });

    await returnLoan(loan._id);
  }

  console.log('Seeded library data (2 books, 1 pending loan request, 1 returned overdue loan with a fine).');
}

// UC-ADMIN-DEPT-002: a trainer with a scheduled training session.
async function seedDepartmentData(section) {
  let trainer = await Trainer.findOne({ name: 'Alex Trainer' });
  if (!trainer) {
    trainer = await Trainer.create({ name: 'Alex Trainer', contractHourLimit: 40 });
  }

  const existingSchedule = await TrainingSchedule.findOne({ trainer: trainer._id, section: section._id });
  if (!existingSchedule) {
    await scheduleTraining(trainer._id, section._id, new Date(), 4);
  }

  console.log('Seeded department data (trainer, training schedule).');
  return { trainer };
}

// UC-ADMIN-RPB-004: an approved department budget request. UC-ADMIN-RPB-001:
// a MonthlyBudgetReport pushed through the full RPB approval chain (DRAFT ->
// BUDGET_OFFICER_REVIEW -> BUREAU_REVIEW -> APPROVED) via the real
// approvalChainService, so its audit trail has all three transitions.
async function seedBudgetData(healthyBudget) {
  let cycle = await BudgetRequestCycle.findOne({ fiscalYear: '2026' });
  if (!cycle) {
    cycle = await BudgetRequestCycle.create({ fiscalYear: '2026' });
  }

  let departmentRequest = await DepartmentBudgetRequest.findOne({ cycle: cycle._id, department: 'General Operations' });
  if (!departmentRequest) {
    departmentRequest = await submitDepartmentBudgetRequest(cycle._id, 'General Operations', healthyBudget._id, 5000);
    departmentRequest = await approveDepartmentBudgetRequest(departmentRequest._id);
  }

  let monthlyReport = await MonthlyBudgetReport.findOne({ department: 'General Operations', period: '2026-08' });
  if (!monthlyReport) {
    monthlyReport = await MonthlyBudgetReport.create({
      department: 'General Operations',
      period: '2026-08',
      budgetAllocation: healthyBudget._id,
      approvalChain: 'RPB',
    });
    while (monthlyReport.status !== 'APPROVED') {
      // eslint-disable-next-line no-await-in-loop
      monthlyReport = await advanceReport(MonthlyBudgetReport, monthlyReport._id);
    }
  }

  console.log('Seeded budget data (cycle, approved department request, fully-approved monthly report).');
}

// UC-ADMIN-FIN-003/004: a bid finalized against an approved vendor, then a
// purchase order issued from it - both real guarded workflows.
async function seedFinanceData(vendor, healthyBudget) {
  let bid = await Bid.findOne({ vendor: vendor._id, description: 'Laptop refresh RFQ' });
  if (!bid) {
    bid = await submitBid(vendor._id, 'Laptop refresh RFQ', 15000);
  }

  let evaluation = await BidEvaluation.findOne({ bid: bid._id });
  if (!evaluation) {
    evaluation = await createBidEvaluation(bid._id, 85, 'Meets all technical requirements.');
    await finalizeBidEvaluation(evaluation._id);
  }

  const existingOrder = await PurchaseOrder.findOne({ vendor: vendor._id, bid: bid._id });
  if (!existingOrder) {
    await issuePurchaseOrder(vendor._id, bid._id, healthyBudget._id, 15000);
  }

  console.log('Seeded finance data (finalized bid evaluation, issued purchase order).');
}

// UC-ADMIN-HR-001/002/003/004/007: a full recruitment-to-training-enrollment
// chain across two employees, plus a MedicalClearance left PENDING for the
// first so a *new* leave/training request for them is blocked live by
// assertNoActiveClearanceHold - the already-approved LeaveRequest below
// proves the happy path worked before that hold was seeded.
async function seedHRData(trainingSchedule) {
  let requisition = await RecruitmentRequisition.findOne({ jobTitle: 'Systems Administrator' });
  if (!requisition) {
    requisition = await RecruitmentRequisition.create({ department: 'IT', jobTitle: 'Systems Administrator', headcount: 1 });
    requisition = await approveRecruitmentRequisition(requisition._id);
  }

  let application = await JobApplication.findOne({ requisition: requisition._id, applicantName: 'Sam Candidate' });
  if (!application) {
    application = await JobApplication.create({
      requisition: requisition._id,
      applicantName: 'Sam Candidate',
      email: 'sam.candidate@example.com',
    });
    await shortlistJobApplication(application._id);
  }

  let janeContract = await EmploymentContract.findOne({ employeeName: 'Jane HR Sample' });
  if (!janeContract) {
    janeContract = await EmploymentContract.create({ employeeName: 'Jane HR Sample', startDate: new Date() });
    janeContract = await signEmploymentContract(janeContract._id);
    janeContract = await activateEmploymentContract(janeContract._id);
  }

  const leaveBalance = await LeaveBalance.findOne({ employeeName: 'Jane HR Sample', year: 2026 });
  const existingLeaveRequest = await LeaveRequest.findOne({ leaveBalance: leaveBalance._id });
  if (!existingLeaveRequest) {
    const startDate = new Date();
    const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const leaveRequest = await submitLeaveRequest(leaveBalance._id, 3, startDate, endDate, 'Family commitment.');
    await approveLeaveRequest(leaveRequest._id);
  }

  // Seeded AFTER the successful leave approval above, on purpose - see the
  // function comment.
  let janeClearance = await MedicalClearance.findOne({ employeeName: 'Jane HR Sample' });
  if (!janeClearance) {
    janeClearance = await MedicalClearance.create({ employeeName: 'Jane HR Sample' });
  }

  let tomContract = await EmploymentContract.findOne({ employeeName: 'Tom Trainee Sample' });
  if (!tomContract) {
    tomContract = await EmploymentContract.create({ employeeName: 'Tom Trainee Sample', startDate: new Date() });
    tomContract = await signEmploymentContract(tomContract._id);
    tomContract = await activateEmploymentContract(tomContract._id);
  }

  if (trainingSchedule) {
    const existingEnrollment = await TrainingEnrollment.findOne({
      employeeName: 'Tom Trainee Sample',
      trainingSchedule: trainingSchedule._id,
    });
    if (!existingEnrollment) {
      await enrollInTraining('Tom Trainee Sample', trainingSchedule._id);
    }
  }

  console.log('Seeded HR data (requisition, application, 2 contracts, approved leave request, pending clearance, training enrollment).');
}

async function run() {
  await connectDB();
  await seedRoles();
  await seedUsers();
  const { vendor, course, healthyBudget } = await seedSupportingData();
  const { section, learner } = await seedRegistrarData(course);
  await seedLibraryData(learner);
  const { trainer } = await seedDepartmentData(section);
  await seedBudgetData(healthyBudget);
  await seedFinanceData(vendor, healthyBudget);
  const trainingSchedule = await TrainingSchedule.findOne({ trainer: trainer._id, section: section._id });
  await seedHRData(trainingSchedule);
  console.log('Seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
