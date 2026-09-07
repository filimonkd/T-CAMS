/**
 * Central config driving the generic WorkflowList/WorkflowDetail/ApprovalAction
 * components. One entry per backend collection - adding a new entity to the
 * UI means adding an entry here, not a new page.
 *
 * NOTE ON SCOPE: the original Phase 1 plan referenced "43 use cases"; the
 * useCases.js registry has grown to 77 across Phases 2-8 as Library,
 * Department, Budget, Finance, HR and Reports were added. This config
 * covers the full current set of 44 backend collections (every route
 * mounted in server/src/routes/index.js), not just the original 43, since
 * limiting it to the original count would leave more than half the built
 * backend without any UI.
 *
 * Field shapes:
 *   listColumns: [{ key, label }]              - columns shown in WorkflowList
 *   formFields:  [{ key, label, type, required, placeholder }] - POST / create form
 *   actions:     [{ key, label, method, path(id), variant, inputs }]
 *     - path(id) returns the endpoint-relative path for the action
 *     - inputs (optional): [{ key, label, type }] rendered in ApprovalAction's
 *       modal when the action needs a request body; omit for a plain confirm
 *   entityType: the Mongoose modelName - must match exactly what
 *     guardService.transitionStatus records, since WorkflowDetail uses it to
 *     call GET /api/audit/:entityType/:entityId for the approval history.
 */

const REF_TYPE = 'ref'; // rendered as a plain text input for an ObjectId string in this scaffold

// Matches server/src/models/User.js's ROLE_NAMES exactly. The last four were
// added in Phase 10 alongside the User model - the Phase 10 seed spec asked
// for library/department/budget/advisor demo users that had no matching
// role in the original 6, which would have rendered an empty sidebar for
// each of them.
export const ROLES = {
  ADMIN: 'ADMIN',
  REGISTRAR: 'REGISTRAR',
  PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER',
  HR_OFFICER: 'HR_OFFICER',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  AUDITOR: 'AUDITOR',
  LIBRARY_OFFICER: 'LIBRARY_OFFICER',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  BUDGET_OFFICER: 'BUDGET_OFFICER',
  ADVISOR: 'ADVISOR',
};

export const moduleConfig = {
  // --- Procurement ---
  vendors: {
    label: 'Vendors',
    entityType: 'Vendor',
    endpoint: '/vendors',
    group: 'procurement',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'contactEmail', label: 'Contact Email', type: 'text' },
      { key: 'contactPhone', label: 'Contact Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
    ],
    actions: [],
  },
  'stock-items': {
    label: 'Stock Items',
    entityType: 'StockItem',
    endpoint: '/stock-items',
    group: 'procurement',
    listColumns: [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Name' },
      { key: 'quantityOnHand', label: 'On Hand' },
      { key: 'reorderLevel', label: 'Reorder Level' },
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'unit', label: 'Unit', type: 'text' },
      { key: 'quantityOnHand', label: 'Quantity On Hand', type: 'number' },
      { key: 'reorderLevel', label: 'Reorder Level', type: 'number' },
      { key: 'vendor', label: 'Vendor ID', type: REF_TYPE },
    ],
    actions: [
      {
        key: 'issue',
        label: 'Issue',
        method: 'post',
        path: (id) => `/stock-items/${id}/issue`,
        variant: 'neutral',
        inputs: [{ key: 'quantity', label: 'Quantity', type: 'number' }],
      },
    ],
  },
  'budget-allocations': {
    label: 'Budget Allocations',
    entityType: 'BudgetAllocation',
    endpoint: '/budget-allocations',
    group: 'procurement',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'department', label: 'Department' },
      { key: 'allocatedAmount', label: 'Allocated' },
      { key: 'spentAmount', label: 'Spent' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'fiscalYear', label: 'Fiscal Year', type: 'text', required: true },
      { key: 'allocatedAmount', label: 'Allocated Amount', type: 'number', required: true },
    ],
    actions: [],
  },

  // --- Academic (Registrar) ---
  programs: {
    label: 'Programs',
    entityType: 'Program',
    endpoint: '/programs',
    group: 'academic',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    actions: [{ key: 'approve', label: 'Approve', method: 'post', path: (id) => `/programs/${id}/approve`, variant: 'success' }],
  },
  courses: {
    label: 'Courses',
    entityType: 'Course',
    endpoint: '/courses',
    group: 'academic',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'title', label: 'Title' }, { key: 'credits', label: 'Credits' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'program', label: 'Program ID', type: REF_TYPE, required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'credits', label: 'Credits', type: 'number' },
    ],
    actions: [{ key: 'retire', label: 'Retire', method: 'post', path: (id) => `/courses/${id}/retire`, variant: 'danger' }],
  },
  sections: {
    label: 'Sections',
    entityType: 'Section',
    endpoint: '/sections',
    group: 'academic',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'term', label: 'Term' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'enrolledCount', label: 'Enrolled' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'course', label: 'Course ID', type: REF_TYPE, required: true },
      { key: 'term', label: 'Term', type: 'text', required: true },
      { key: 'capacity', label: 'Capacity', type: 'number', required: true },
    ],
    actions: [
      {
        key: 'capacity',
        label: 'Set Capacity',
        method: 'post',
        path: (id) => `/sections/${id}/capacity`,
        variant: 'neutral',
        inputs: [{ key: 'capacity', label: 'New Capacity', type: 'number' }],
      },
      { key: 'close', label: 'Close', method: 'post', path: (id) => `/sections/${id}/close`, variant: 'danger' },
    ],
  },
  learners: {
    label: 'Learners',
    entityType: 'Learner',
    endpoint: '/learners',
    group: 'academic',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'firstName', label: 'First Name', type: 'text', required: true },
      { key: 'lastName', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
    ],
    actions: [],
  },
  enrollments: {
    label: 'Enrollments',
    entityType: 'Enrollment',
    endpoint: '/enrollments',
    group: 'academic',
    listColumns: [{ key: 'learner', label: 'Learner' }, { key: 'section', label: 'Section' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'learnerId', label: 'Learner ID', type: REF_TYPE, required: true },
      { key: 'sectionId', label: 'Section ID', type: REF_TYPE, required: true },
    ],
    actions: [{ key: 'withdraw', label: 'Withdraw', method: 'post', path: (id) => `/enrollments/${id}/withdraw`, variant: 'danger' }],
  },

  // --- HR (core, Phase 2) ---
  'leave-balances': {
    label: 'Leave Balances',
    entityType: 'LeaveBalance',
    endpoint: '/leave-balances',
    group: 'hrCore',
    listColumns: [
      { key: 'employeeName', label: 'Employee' },
      { key: 'leaveType', label: 'Type' },
      { key: 'entitledDays', label: 'Entitled' },
      { key: 'usedDays', label: 'Used' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'employeeName', label: 'Employee Name', type: 'text', required: true },
      { key: 'leaveType', label: 'Leave Type', type: 'text' },
      { key: 'year', label: 'Year', type: 'number', required: true },
      { key: 'entitledDays', label: 'Entitled Days', type: 'number', required: true },
    ],
    actions: [
      {
        key: 'approve',
        label: 'Approve Leave',
        method: 'post',
        path: (id) => `/leave-balances/${id}/approve`,
        variant: 'success',
        inputs: [{ key: 'days', label: 'Days', type: 'number' }],
      },
    ],
  },

  // --- Assets ---
  'asset-assignments': {
    label: 'Asset Assignments',
    entityType: 'AssetAssignment',
    endpoint: '/asset-assignments',
    group: 'asset',
    listColumns: [
      { key: 'assetTag', label: 'Asset Tag' },
      { key: 'name', label: 'Name' },
      { key: 'assignedTo', label: 'Assigned To' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'assignedTo', label: 'Assigned To', type: 'text' },
    ],
    actions: [],
  },

  // --- Finance (student fees, Phase 2) ---
  'fee-accounts': {
    label: 'Fee Accounts',
    entityType: 'FeeAccount',
    endpoint: '/fee-accounts',
    group: 'studentFinance',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'learnerName', label: 'Learner' },
      { key: 'totalDue', label: 'Due' },
      { key: 'totalPaid', label: 'Paid' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'learnerName', label: 'Learner Name', type: 'text', required: true },
      { key: 'totalDue', label: 'Total Due', type: 'number', required: true },
    ],
    actions: [],
  },

  // --- Facilities ---
  rooms: {
    label: 'Rooms',
    entityType: 'Room',
    endpoint: '/rooms',
    group: 'facilities',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'building', label: 'Building' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'building', label: 'Building', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number', required: true },
    ],
    actions: [
      { key: 'book', label: 'Book', method: 'post', path: (id) => `/rooms/${id}/book`, variant: 'neutral' },
      { key: 'release', label: 'Release', method: 'post', path: (id) => `/rooms/${id}/release`, variant: 'success' },
    ],
  },

  // --- Library ---
  'library-books': {
    label: 'Books',
    entityType: 'Book',
    endpoint: '/library/books',
    group: 'library',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'catalogId', label: 'Catalog ID' },
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'catalogId', label: 'Catalog ID', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'author', label: 'Author', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
    ],
    actions: [],
  },
  'library-loan-requests': {
    label: 'Loan Requests',
    entityType: 'LoanRequest',
    endpoint: '/library/loan-requests',
    group: 'library',
    listColumns: [{ key: 'book', label: 'Book' }, { key: 'learner', label: 'Learner' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'book', label: 'Book ID', type: REF_TYPE, required: true },
      { key: 'learner', label: 'Learner ID', type: REF_TYPE, required: true },
    ],
    actions: [{ key: 'approve', label: 'Approve', method: 'post', path: (id) => `/library/loan-requests/${id}/approve`, variant: 'success' }],
  },
  'library-loans': {
    label: 'Loans',
    entityType: 'Loan',
    endpoint: '/library/loans',
    group: 'library',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'book', label: 'Book' },
      { key: 'learner', label: 'Learner' },
      { key: 'dueAt', label: 'Due At', type: 'date' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'bookId', label: 'Book ID', type: REF_TYPE, required: true },
      { key: 'learnerId', label: 'Learner ID', type: REF_TYPE, required: true },
    ],
    actions: [{ key: 'return', label: 'Return', method: 'post', path: (id) => `/library/loans/${id}/return`, variant: 'success' }],
  },
  'library-reservations': {
    label: 'Book Reservations',
    entityType: 'BookReservation',
    endpoint: '/library/reservations',
    group: 'library',
    listColumns: [
      { key: 'book', label: 'Book' },
      { key: 'learner', label: 'Learner' },
      { key: 'slotStart', label: 'Slot Start', type: 'date' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'bookId', label: 'Book ID', type: REF_TYPE, required: true },
      { key: 'learnerId', label: 'Learner ID', type: REF_TYPE, required: true },
      { key: 'slotStart', label: 'Slot Start', type: 'datetime-local', required: true },
      { key: 'slotEnd', label: 'Slot End', type: 'datetime-local', required: true },
    ],
    actions: [{ key: 'cancel', label: 'Cancel', method: 'post', path: (id) => `/library/reservations/${id}/cancel`, variant: 'danger' }],
  },
  'library-binding-requests': {
    label: 'Binding Requests',
    entityType: 'BindingRequest',
    endpoint: '/library/binding-requests',
    group: 'library',
    listColumns: [{ key: 'book', label: 'Book' }, { key: 'reason', label: 'Reason' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'bookId', label: 'Book ID', type: REF_TYPE, required: true },
      { key: 'reason', label: 'Reason', type: 'text', required: true },
    ],
    actions: [{ key: 'complete', label: 'Complete', method: 'post', path: (id) => `/library/binding-requests/${id}/complete`, variant: 'success' }],
  },
  'library-fines': {
    label: 'Fines',
    entityType: 'Fine',
    endpoint: '/library/fines',
    group: 'library',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'learner', label: 'Learner' },
      { key: 'overdueDays', label: 'Overdue Days' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [],
    actions: [
      { key: 'pay', label: 'Pay', method: 'post', path: (id) => `/library/fines/${id}/pay`, variant: 'success' },
      { key: 'waive', label: 'Waive', method: 'post', path: (id) => `/library/fines/${id}/waive`, variant: 'neutral' },
    ],
  },

  // --- Department ---
  'department-trainers': {
    label: 'Trainers',
    entityType: 'Trainer',
    endpoint: '/department/trainers',
    group: 'department',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'contractHourLimit', label: 'Hour Limit' },
      { key: 'scheduledHours', label: 'Scheduled' },
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'contractHourLimit', label: 'Contract Hour Limit', type: 'number', required: true },
    ],
    actions: [],
  },
  'department-trainee-placements': {
    label: 'Trainee Placements',
    entityType: 'TraineePlacement',
    endpoint: '/department/trainee-placements',
    group: 'department',
    listColumns: [{ key: 'learner', label: 'Learner' }, { key: 'section', label: 'Section' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'learnerId', label: 'Learner ID', type: REF_TYPE, required: true },
      { key: 'sectionId', label: 'Section ID', type: REF_TYPE, required: true },
    ],
    actions: [{ key: 'withdraw', label: 'Withdraw', method: 'post', path: (id) => `/department/trainee-placements/${id}/withdraw`, variant: 'danger' }],
  },
  'department-training-schedules': {
    label: 'Training Schedules',
    entityType: 'TrainingSchedule',
    endpoint: '/department/training-schedules',
    group: 'department',
    listColumns: [
      { key: 'trainer', label: 'Trainer' },
      { key: 'section', label: 'Section' },
      { key: 'scheduledDate', label: 'Date', type: 'date' },
      { key: 'hours', label: 'Hours' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'trainerId', label: 'Trainer ID', type: REF_TYPE, required: true },
      { key: 'sectionId', label: 'Section ID', type: REF_TYPE, required: true },
      { key: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true },
      { key: 'hours', label: 'Hours', type: 'number', required: true },
    ],
    actions: [{ key: 'cancel', label: 'Cancel', method: 'post', path: (id) => `/department/training-schedules/${id}/cancel`, variant: 'danger' }],
  },
  'department-material-requests': {
    label: 'Material Requests',
    entityType: 'MaterialRequest',
    endpoint: '/department/material-requests',
    group: 'department',
    listColumns: [
      { key: 'stockItem', label: 'Stock Item' },
      { key: 'quantityRequested', label: 'Qty' },
      { key: 'estimatedCost', label: 'Cost' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'stockItemId', label: 'Stock Item ID', type: REF_TYPE, required: true },
      { key: 'budgetAllocationId', label: 'Budget Allocation ID', type: REF_TYPE, required: true },
      { key: 'quantityRequested', label: 'Quantity Requested', type: 'number', required: true },
      { key: 'estimatedCost', label: 'Estimated Cost', type: 'number', required: true },
    ],
    actions: [
      { key: 'approve', label: 'Approve', method: 'post', path: (id) => `/department/material-requests/${id}/approve`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/department/material-requests/${id}/reject`, variant: 'danger' },
    ],
  },
  'department-course-outlines': {
    label: 'Course Outlines',
    entityType: 'CourseOutline',
    endpoint: '/department/course-outlines',
    group: 'department',
    listColumns: [{ key: 'course', label: 'Course' }, { key: 'version', label: 'Version' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'course', label: 'Course ID', type: REF_TYPE, required: true },
      { key: 'version', label: 'Version', type: 'text', required: true },
      { key: 'content', label: 'Content', type: 'textarea', required: true },
    ],
    actions: [
      { key: 'approve', label: 'Approve', method: 'post', path: (id) => `/department/course-outlines/${id}/approve`, variant: 'success' },
      { key: 'archive', label: 'Archive', method: 'post', path: (id) => `/department/course-outlines/${id}/archive`, variant: 'neutral' },
    ],
  },
  'department-maintenance-requisitions': {
    label: 'Maintenance Requisitions',
    entityType: 'MaintenanceRequisition',
    endpoint: '/department/maintenance-requisitions',
    group: 'department',
    listColumns: [
      { key: 'room', label: 'Room' },
      { key: 'description', label: 'Description' },
      { key: 'estimatedCost', label: 'Cost' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'roomId', label: 'Room ID', type: REF_TYPE, required: true },
      { key: 'budgetAllocationId', label: 'Budget Allocation ID', type: REF_TYPE, required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'estimatedCost', label: 'Estimated Cost', type: 'number', required: true },
    ],
    actions: [
      { key: 'approve', label: 'Approve', method: 'post', path: (id) => `/department/maintenance-requisitions/${id}/approve`, variant: 'success' },
      { key: 'complete', label: 'Complete', method: 'post', path: (id) => `/department/maintenance-requisitions/${id}/complete`, variant: 'neutral' },
    ],
  },
  'department-attendance-records': {
    label: 'Attendance Records',
    entityType: 'AttendanceRecord',
    endpoint: '/department/attendance-records',
    group: 'department',
    listColumns: [
      { key: 'learner', label: 'Learner' },
      { key: 'section', label: 'Section' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'learner', label: 'Learner ID', type: REF_TYPE, required: true },
      { key: 'section', label: 'Section ID', type: REF_TYPE, required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'status', label: 'Status (PRESENT/ABSENT/LATE/EXCUSED)', type: 'text' },
    ],
    actions: [],
  },
  'department-exam-room-assignments': {
    label: 'Exam Room Assignments',
    entityType: 'ExamRoomAssignment',
    endpoint: '/department/exam-room-assignments',
    group: 'department',
    listColumns: [
      { key: 'section', label: 'Section' },
      { key: 'room', label: 'Room' },
      { key: 'examDate', label: 'Exam Date', type: 'date' },
      { key: 'cohortSize', label: 'Cohort Size' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'sectionId', label: 'Section ID', type: REF_TYPE, required: true },
      { key: 'roomId', label: 'Room ID', type: REF_TYPE, required: true },
      { key: 'examDate', label: 'Exam Date', type: 'date', required: true },
      { key: 'cohortSize', label: 'Cohort Size', type: 'number', required: true },
    ],
    actions: [{ key: 'cancel', label: 'Cancel', method: 'post', path: (id) => `/department/exam-room-assignments/${id}/cancel`, variant: 'danger' }],
  },

  // --- Budget (RPB) ---
  'budget-monthly-reports': {
    label: 'Monthly Budget Reports (RPB)',
    entityType: 'MonthlyBudgetReport',
    endpoint: '/budget/monthly-budget-reports',
    group: 'budget',
    isReport: true,
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'department', label: 'Department' }, { key: 'period', label: 'Period' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'period', label: 'Period (e.g. 2026-08)', type: 'text', required: true },
      { key: 'budgetAllocation', label: 'Budget Allocation ID', type: REF_TYPE },
    ],
    actions: [
      { key: 'advance', label: 'Advance', method: 'post', path: (id) => `/budget/monthly-budget-reports/${id}/advance`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/budget/monthly-budget-reports/${id}/reject`, variant: 'danger' },
    ],
  },
  'budget-annual-plans': {
    label: 'Annual Budget Plans (RPB)',
    entityType: 'AnnualBudgetPlan',
    endpoint: '/budget/annual-budget-plans',
    group: 'budget',
    isReport: true,
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'department', label: 'Department' }, { key: 'fiscalYear', label: 'Fiscal Year' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'fiscalYear', label: 'Fiscal Year', type: 'text', required: true },
      { key: 'totalRequestedAmount', label: 'Total Requested Amount', type: 'number', required: true },
    ],
    actions: [
      { key: 'advance', label: 'Advance', method: 'post', path: (id) => `/budget/annual-budget-plans/${id}/advance`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/budget/annual-budget-plans/${id}/reject`, variant: 'danger' },
    ],
  },
  'budget-request-cycles': {
    label: 'Budget Request Cycles',
    entityType: 'BudgetRequestCycle',
    endpoint: '/budget/request-cycles',
    group: 'budget',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'fiscalYear', label: 'Fiscal Year' }, { key: 'status', label: 'Status' }],
    formFields: [{ key: 'fiscalYear', label: 'Fiscal Year', type: 'text', required: true }],
    actions: [{ key: 'close', label: 'Close', method: 'post', path: (id) => `/budget/request-cycles/${id}/close`, variant: 'danger' }],
  },
  'budget-department-requests': {
    label: 'Department Budget Requests',
    entityType: 'DepartmentBudgetRequest',
    endpoint: '/budget/department-requests',
    group: 'budget',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'department', label: 'Department' },
      { key: 'requestedAmount', label: 'Requested' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'cycleId', label: 'Cycle ID', type: REF_TYPE, required: true },
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'budgetAllocationId', label: 'Budget Allocation ID', type: REF_TYPE, required: true },
      { key: 'requestedAmount', label: 'Requested Amount', type: 'number', required: true },
    ],
    actions: [
      { key: 'approve', label: 'Approve', method: 'post', path: (id) => `/budget/department-requests/${id}/approve`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/budget/department-requests/${id}/reject`, variant: 'danger' },
    ],
  },
  'budget-bureau-submissions': {
    label: 'Bureau Submissions',
    entityType: 'BureauSubmission',
    endpoint: '/budget/bureau-submissions',
    group: 'budget',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'totalAmount', label: 'Total' }, { key: 'status', label: 'Status' }],
    formFields: [{ key: 'cycleId', label: 'Cycle ID', type: REF_TYPE, required: true }],
    actions: [
      { key: 'submit', label: 'Submit', method: 'post', path: (id) => `/budget/bureau-submissions/${id}/submit`, variant: 'success' },
      { key: 'acknowledge', label: 'Acknowledge', method: 'post', path: (id) => `/budget/bureau-submissions/${id}/acknowledge`, variant: 'neutral' },
    ],
  },
  'budget-utilization-entries': {
    label: 'Budget Utilization Entries',
    entityType: 'BudgetUtilizationEntry',
    endpoint: '/budget/utilization-entries',
    group: 'budget',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'amount', label: 'Amount' }, { key: 'description', label: 'Description' }],
    formFields: [
      { key: 'budgetAllocationId', label: 'Budget Allocation ID', type: REF_TYPE, required: true },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      { key: 'description', label: 'Description', type: 'text', required: true },
    ],
    actions: [],
  },

  // --- Finance ---
  'finance-monthly-reports': {
    label: 'Monthly Budget Reports (Finance)',
    entityType: 'MonthlyBudgetReport',
    endpoint: '/finance/monthly-budget-reports',
    group: 'finance',
    isReport: true,
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'department', label: 'Department' }, { key: 'period', label: 'Period' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'period', label: 'Period (e.g. 2026-08)', type: 'text', required: true },
      { key: 'budgetAllocation', label: 'Budget Allocation ID', type: REF_TYPE },
    ],
    actions: [
      { key: 'advance', label: 'Advance', method: 'post', path: (id) => `/finance/monthly-budget-reports/${id}/advance`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/finance/monthly-budget-reports/${id}/reject`, variant: 'danger' },
    ],
  },
  'finance-annual-plans': {
    label: 'Annual Budget Plans (Finance)',
    entityType: 'AnnualBudgetPlan',
    endpoint: '/finance/annual-budget-plans',
    group: 'finance',
    isReport: true,
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'department', label: 'Department' }, { key: 'fiscalYear', label: 'Fiscal Year' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'fiscalYear', label: 'Fiscal Year', type: 'text', required: true },
      { key: 'totalRequestedAmount', label: 'Total Requested Amount', type: 'number', required: true },
    ],
    actions: [
      { key: 'advance', label: 'Advance', method: 'post', path: (id) => `/finance/annual-budget-plans/${id}/advance`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/finance/annual-budget-plans/${id}/reject`, variant: 'danger' },
    ],
  },
  'finance-bids': {
    label: 'Bids',
    entityType: 'Bid',
    endpoint: '/finance/bids',
    group: 'finance',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'vendor', label: 'Vendor' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'vendorId', label: 'Vendor ID', type: REF_TYPE, required: true },
      { key: 'description', label: 'Description', type: 'text', required: true },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
    ],
    actions: [],
  },
  'finance-bid-evaluations': {
    label: 'Bid Evaluations',
    entityType: 'BidEvaluation',
    endpoint: '/finance/bid-evaluations',
    group: 'finance',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'bid', label: 'Bid' }, { key: 'score', label: 'Score' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'bidId', label: 'Bid ID', type: REF_TYPE, required: true },
      { key: 'score', label: 'Score (0-100)', type: 'number', required: true },
      { key: 'evaluatorNotes', label: 'Evaluator Notes', type: 'textarea' },
    ],
    actions: [
      { key: 'finalize', label: 'Finalize', method: 'post', path: (id) => `/finance/bid-evaluations/${id}/finalize`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/finance/bid-evaluations/${id}/reject`, variant: 'danger' },
    ],
  },
  'finance-purchase-orders': {
    label: 'Purchase Orders',
    entityType: 'PurchaseOrder',
    endpoint: '/finance/purchase-orders',
    group: 'finance',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'vendor', label: 'Vendor' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'vendorId', label: 'Vendor ID', type: REF_TYPE, required: true },
      { key: 'bidId', label: 'Bid ID (optional)', type: REF_TYPE },
      { key: 'budgetAllocationId', label: 'Budget Allocation ID', type: REF_TYPE },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
    ],
    actions: [
      { key: 'fulfill', label: 'Fulfill', method: 'post', path: (id) => `/finance/purchase-orders/${id}/fulfill`, variant: 'success' },
      { key: 'cancel', label: 'Cancel', method: 'post', path: (id) => `/finance/purchase-orders/${id}/cancel`, variant: 'danger' },
    ],
  },
  'finance-expense-claims': {
    label: 'Expense Claims',
    entityType: 'ExpenseClaim',
    endpoint: '/finance/expense-claims',
    group: 'finance',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'claimantName', label: 'Claimant' },
      { key: 'requestedAmount', label: 'Requested' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'claimantName', label: 'Claimant Name', type: 'text', required: true },
      { key: 'budgetAllocationId', label: 'Budget Allocation ID', type: REF_TYPE, required: true },
      { key: 'requestedAmount', label: 'Requested Amount', type: 'number', required: true },
      { key: 'justification', label: 'Justification (min 50 characters)', type: 'textarea', required: true },
    ],
    actions: [
      { key: 'approve', label: 'Approve', method: 'post', path: (id) => `/finance/expense-claims/${id}/approve`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/finance/expense-claims/${id}/reject`, variant: 'danger' },
    ],
  },
  'finance-petty-cash-funds': {
    label: 'Petty Cash Funds',
    entityType: 'PettyCashFund',
    endpoint: '/finance/petty-cash-funds',
    group: 'finance',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'currentBalance', label: 'Balance' }, { key: 'isActive', label: 'Active' }],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'currentBalance', label: 'Current Balance', type: 'number', required: true },
    ],
    actions: [],
  },
  'finance-petty-cash-transactions': {
    label: 'Petty Cash Transactions',
    entityType: 'PettyCashTransaction',
    endpoint: '/finance/petty-cash-transactions',
    group: 'finance',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'pettyCashFund', label: 'Fund' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'fundId', label: 'Fund ID', type: REF_TYPE, required: true },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      { key: 'purpose', label: 'Purpose', type: 'text', required: true },
    ],
    actions: [{ key: 'void', label: 'Void', method: 'post', path: (id) => `/finance/petty-cash-transactions/${id}/void`, variant: 'danger' }],
  },

  // --- HR (Phase 7) ---
  'hr-recruitment-requisitions': {
    label: 'Recruitment Requisitions',
    entityType: 'RecruitmentRequisition',
    endpoint: '/hr/recruitment-requisitions',
    group: 'hrAdmin',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'department', label: 'Department' },
      { key: 'jobTitle', label: 'Job Title' },
      { key: 'headcount', label: 'Headcount' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'jobTitle', label: 'Job Title', type: 'text', required: true },
      { key: 'headcount', label: 'Headcount', type: 'number', required: true },
    ],
    actions: [
      { key: 'approve', label: 'Approve', method: 'post', path: (id) => `/hr/recruitment-requisitions/${id}/approve`, variant: 'success' },
      { key: 'close', label: 'Close', method: 'post', path: (id) => `/hr/recruitment-requisitions/${id}/close`, variant: 'neutral' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/hr/recruitment-requisitions/${id}/reject`, variant: 'danger' },
    ],
  },
  'hr-job-applications': {
    label: 'Job Applications',
    entityType: 'JobApplication',
    endpoint: '/hr/job-applications',
    group: 'hrAdmin',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'applicantName', label: 'Applicant' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'requisition', label: 'Requisition ID', type: REF_TYPE, required: true },
      { key: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
    ],
    actions: [
      { key: 'shortlist', label: 'Shortlist', method: 'post', path: (id) => `/hr/job-applications/${id}/shortlist`, variant: 'neutral' },
      { key: 'hire', label: 'Hire', method: 'post', path: (id) => `/hr/job-applications/${id}/hire`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/hr/job-applications/${id}/reject`, variant: 'danger' },
    ],
  },
  'hr-employment-contracts': {
    label: 'Employment Contracts',
    entityType: 'EmploymentContract',
    endpoint: '/hr/employment-contracts',
    group: 'hrAdmin',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'employeeName', label: 'Employee' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'employeeName', label: 'Employee Name', type: 'text', required: true },
      { key: 'jobApplication', label: 'Job Application ID', type: REF_TYPE },
      { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    ],
    actions: [
      { key: 'sign', label: 'Sign', method: 'post', path: (id) => `/hr/employment-contracts/${id}/sign`, variant: 'neutral' },
      { key: 'activate', label: 'Activate', method: 'post', path: (id) => `/hr/employment-contracts/${id}/activate`, variant: 'success' },
      { key: 'terminate', label: 'Terminate', method: 'post', path: (id) => `/hr/employment-contracts/${id}/terminate`, variant: 'danger' },
    ],
  },
  'hr-leave-requests': {
    label: 'Leave Requests',
    entityType: 'LeaveRequest',
    endpoint: '/hr/leave-requests',
    group: 'hrAdmin',
    listColumns: [
      { key: 'code', label: 'Code' },
      { key: 'requestedDays', label: 'Days' },
      { key: 'startDate', label: 'Start', type: 'date' },
      { key: 'endDate', label: 'End', type: 'date' },
      { key: 'status', label: 'Status' },
    ],
    formFields: [
      { key: 'leaveBalanceId', label: 'Leave Balance ID', type: REF_TYPE, required: true },
      { key: 'requestedDays', label: 'Requested Days', type: 'number', required: true },
      { key: 'startDate', label: 'Start Date', type: 'date', required: true },
      { key: 'endDate', label: 'End Date', type: 'date', required: true },
      { key: 'reason', label: 'Reason', type: 'textarea' },
    ],
    actions: [
      { key: 'approve', label: 'Approve', method: 'post', path: (id) => `/hr/leave-requests/${id}/approve`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/hr/leave-requests/${id}/reject`, variant: 'danger' },
    ],
  },
  'hr-medical-clearances': {
    label: 'Medical Clearances',
    entityType: 'MedicalClearance',
    endpoint: '/hr/medical-clearances',
    group: 'hrAdmin',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'employeeName', label: 'Employee' }, { key: 'status', label: 'Status' }],
    formFields: [{ key: 'employeeName', label: 'Employee Name', type: 'text', required: true }],
    actions: [
      { key: 'clear', label: 'Clear', method: 'post', path: (id) => `/hr/medical-clearances/${id}/clear`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/hr/medical-clearances/${id}/reject`, variant: 'danger' },
    ],
  },
  'hr-property-clearances': {
    label: 'Property Clearances',
    entityType: 'PropertyClearance',
    endpoint: '/hr/property-clearances',
    group: 'hrAdmin',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'employeeName', label: 'Employee' }, { key: 'status', label: 'Status' }],
    formFields: [{ key: 'employeeName', label: 'Employee Name', type: 'text', required: true }],
    actions: [
      { key: 'clear', label: 'Clear', method: 'post', path: (id) => `/hr/property-clearances/${id}/clear`, variant: 'success' },
      { key: 'reject', label: 'Reject', method: 'post', path: (id) => `/hr/property-clearances/${id}/reject`, variant: 'danger' },
    ],
  },
  'hr-training-enrollments': {
    label: 'Training Enrollments',
    entityType: 'TrainingEnrollment',
    endpoint: '/hr/training-enrollments',
    group: 'hrAdmin',
    listColumns: [{ key: 'employeeName', label: 'Employee' }, { key: 'trainingSchedule', label: 'Training Schedule' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'employeeName', label: 'Employee Name', type: 'text', required: true },
      { key: 'trainingScheduleId', label: 'Training Schedule ID', type: REF_TYPE, required: true },
    ],
    actions: [
      { key: 'complete', label: 'Complete', method: 'post', path: (id) => `/hr/training-enrollments/${id}/complete`, variant: 'success' },
      { key: 'cancel', label: 'Cancel', method: 'post', path: (id) => `/hr/training-enrollments/${id}/cancel`, variant: 'danger' },
    ],
  },
  'hr-biometric-enrollments': {
    label: 'Biometric Enrollments',
    entityType: 'BiometricEnrollment',
    endpoint: '/hr/biometric-enrollments',
    group: 'hrAdmin',
    listColumns: [{ key: 'code', label: 'Code' }, { key: 'employeeName', label: 'Employee' }, { key: 'status', label: 'Status' }],
    formFields: [
      { key: 'employeeName', label: 'Employee Name', type: 'text', required: true },
      { key: 'biometricHash', label: 'Biometric Hash', type: 'text', required: true },
    ],
    actions: [{ key: 'revoke', label: 'Revoke', method: 'post', path: (id) => `/hr/biometric-enrollments/${id}/revoke`, variant: 'danger' }],
  },
};

// Sidebar grouping. `roles` gates visibility - ADMIN always sees everything
// (enforced in AuthContext.hasRole), AUDITOR is read-heavy so is included
// broadly since Role.js grants it QMS:READ/AUDIT:READ across the system.
export const moduleGroups = [
  { key: 'procurement', label: 'Procurement', roles: [ROLES.PROCUREMENT_OFFICER, ROLES.AUDITOR] },
  { key: 'academic', label: 'Academic (Registrar)', roles: [ROLES.REGISTRAR, ROLES.ADVISOR, ROLES.AUDITOR] },
  { key: 'hrCore', label: 'HR - Leave', roles: [ROLES.HR_OFFICER, ROLES.AUDITOR] },
  { key: 'asset', label: 'Assets', roles: [ROLES.ADMIN, ROLES.AUDITOR] },
  { key: 'studentFinance', label: 'Student Fees', roles: [ROLES.FINANCE_OFFICER, ROLES.AUDITOR] },
  { key: 'facilities', label: 'Facilities', roles: [ROLES.ADMIN, ROLES.AUDITOR] },
  { key: 'library', label: 'Library', roles: [ROLES.LIBRARY_OFFICER, ROLES.AUDITOR] },
  { key: 'department', label: 'Department', roles: [ROLES.DEPARTMENT_HEAD, ROLES.AUDITOR] },
  { key: 'budget', label: 'Budget (RPB)', roles: [ROLES.BUDGET_OFFICER, ROLES.AUDITOR] },
  { key: 'finance', label: 'Finance', roles: [ROLES.FINANCE_OFFICER, ROLES.AUDITOR] },
  { key: 'hrAdmin', label: 'Human Resources', roles: [ROLES.HR_OFFICER, ROLES.AUDITOR] },
];

export function getModulesForGroup(groupKey) {
  return Object.entries(moduleConfig)
    .filter(([, config]) => config.group === groupKey)
    .map(([key, config]) => ({ key, ...config }));
}
