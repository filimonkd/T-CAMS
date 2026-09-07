/**
 * T-CAMS Use Case Registry
 *
 * COMPLIANCE STATUS: DRAFT PLACEHOLDER.
 * The `isoClause` and `regulatoryClause` values below are draft mappings
 * only (ISO 9001:2015 clause numbers used as a structural placeholder).
 * They have NOT been validated by a compliance/QA function and must be
 * reviewed and confirmed against the organization's actual QMS and the
 * regulatory framework that applies to its jurisdiction before this
 * registry is relied on for audit or certification purposes.
 *
 * Each entry:
 *   code               - stable unique identifier for the use case
 *   name               - short human-readable title
 *   module             - functional area this use case belongs to
 *   description        - one-line summary of the action/workflow
 *   isoClause          - draft ISO 9001:2015 clause reference (placeholder)
 *   regulatoryClause   - draft internal/regulatory policy reference (placeholder)
 *   guardRules         - names of guardService primitives expected to apply
 */

const MODULES = {
  PROCUREMENT: 'PROCUREMENT',
  ACADEMIC: 'ACADEMIC',
  HR: 'HR',
  ASSET: 'ASSET',
  FINANCE: 'FINANCE',
  FACILITIES: 'FACILITIES',
  QMS: 'QMS',
  LIBRARY: 'LIBRARY',
};

const COMPLIANCE_STATUS = 'DRAFT_PLACEHOLDER';

const useCases = [
  // --- Procurement / Inventory (Vendor, StockItem, BudgetAllocation) ---
  { code: 'PROC-001', name: 'Register New Vendor', module: MODULES.PROCUREMENT, description: 'Capture a new vendor record pending approval.', isoClause: '8.4.1', regulatoryClause: 'INST-POL-PROC §1.1 (placeholder)', guardRules: ['ensureUnique'] },
  { code: 'PROC-002', name: 'Approve Vendor for Sourcing', module: MODULES.PROCUREMENT, description: 'Move a vendor from pending approval to approved status.', isoClause: '8.4.1', regulatoryClause: 'INST-POL-PROC §1.2 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'PROC-003', name: 'Raise Purchase Requisition', module: MODULES.PROCUREMENT, description: 'Request procurement of goods/services against a budget line.', isoClause: '8.4.2', regulatoryClause: 'INST-POL-PROC §2.1 (placeholder)', guardRules: ['ensureSufficientBudget'] },
  { code: 'PROC-004', name: 'Approve Budget Allocation', module: MODULES.PROCUREMENT, description: 'Approve a proposed budget allocation for a fiscal period.', isoClause: '7.1.1', regulatoryClause: 'INST-POL-FIN §1.1 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'PROC-005', name: 'Record Stock Receipt (Goods Inward)', module: MODULES.PROCUREMENT, description: 'Record incoming stock quantity against a stock item.', isoClause: '8.5.4', regulatoryClause: 'INST-POL-PROC §3.1 (placeholder)', guardRules: ['ensureExists'] },
  { code: 'PROC-006', name: 'Issue Stock Item to Department', module: MODULES.PROCUREMENT, description: 'Issue stock from inventory to a requesting department.', isoClause: '8.5.1', regulatoryClause: 'INST-POL-PROC §3.2 (placeholder)', guardRules: ['ensureSufficientStock'] },
  { code: 'PROC-007', name: 'Conduct Stock Reconciliation / Cycle Count', module: MODULES.PROCUREMENT, description: 'Reconcile recorded stock quantity against physical count.', isoClause: '8.5.4', regulatoryClause: 'INST-POL-PROC §3.3 (placeholder)', guardRules: [] },
  { code: 'PROC-008', name: 'Flag Low Stock Reorder Alert', module: MODULES.PROCUREMENT, description: 'Raise an alert when stock falls below reorder level.', isoClause: '6.1.1', regulatoryClause: 'INST-POL-PROC §3.4 (placeholder)', guardRules: ['ensureSufficientStock'] },

  // --- Academic (Program, Section, Course) ---
  { code: 'ACAD-001', name: 'Create New Academic Program', module: MODULES.ACADEMIC, description: 'Define a new academic/training program.', isoClause: '8.3.2', regulatoryClause: 'INST-POL-ACAD §1.1 (placeholder)', guardRules: ['ensureUnique'] },
  { code: 'ACAD-002', name: 'Approve Program Curriculum', module: MODULES.ACADEMIC, description: 'Approve a program moving from draft to active status.', isoClause: '8.3.4', regulatoryClause: 'INST-POL-ACAD §1.2 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'ACAD-003', name: 'Create Course under Program', module: MODULES.ACADEMIC, description: 'Add a new course linked to an academic program.', isoClause: '8.3.3', regulatoryClause: 'INST-POL-ACAD §2.1 (placeholder)', guardRules: ['ensureExists'] },
  { code: 'ACAD-004', name: 'Retire/Deactivate Course', module: MODULES.ACADEMIC, description: 'Retire a course so it can no longer be offered in new sections.', isoClause: '8.3.6', regulatoryClause: 'INST-POL-ACAD §2.2 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'ACAD-005', name: 'Create Section for Course Offering', module: MODULES.ACADEMIC, description: 'Open a section (offering) of a course for a term.', isoClause: '8.5.1', regulatoryClause: 'INST-POL-ACAD §3.1 (placeholder)', guardRules: ['ensureExists'] },
  { code: 'ACAD-006', name: 'Assign Section Capacity Limit', module: MODULES.ACADEMIC, description: 'Set or adjust the maximum enrollment capacity of a section.', isoClause: '8.5.1', regulatoryClause: 'INST-POL-ACAD §3.2 (placeholder)', guardRules: [] },
  { code: 'ACAD-007', name: 'Enroll Learner into Section', module: MODULES.ACADEMIC, description: 'Enroll a learner into a section, subject to available capacity.', isoClause: '8.5.1', regulatoryClause: 'INST-POL-ACAD §3.3 (placeholder)', guardRules: ['ensureCapacityAvailable'] },
  { code: 'ACAD-008', name: 'Close Section at Term End', module: MODULES.ACADEMIC, description: 'Close a section once the academic term has concluded.', isoClause: '8.5.1', regulatoryClause: 'INST-POL-ACAD §3.4 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },

  // --- HR (LeaveBalance) ---
  { code: 'HR-001', name: 'Initialize Annual Leave Balance', module: MODULES.HR, description: 'Create the annual leave balance record for a staff member.', isoClause: '7.1.2', regulatoryClause: 'INST-POL-HR §1.1 (placeholder)', guardRules: ['ensureUnique'] },
  { code: 'HR-002', name: 'Submit Leave Request', module: MODULES.HR, description: 'Staff member submits a request to take leave.', isoClause: '7.1.2', regulatoryClause: 'INST-POL-HR §2.1 (placeholder)', guardRules: ['ensureSufficientLeaveBalance'] },
  { code: 'HR-003', name: 'Approve Leave Request', module: MODULES.HR, description: 'Manager approves a submitted leave request.', isoClause: '7.1.2', regulatoryClause: 'INST-POL-HR §2.2 (placeholder)', guardRules: ['ensureSufficientLeaveBalance', 'ensureStatusTransitionAllowed'] },
  { code: 'HR-004', name: 'Reject Leave Request', module: MODULES.HR, description: 'Manager rejects a submitted leave request.', isoClause: '7.1.2', regulatoryClause: 'INST-POL-HR §2.3 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'HR-005', name: 'Adjust/Carry-Forward Leave Balance', module: MODULES.HR, description: 'Apply a year-end adjustment or carry-forward to a leave balance.', isoClause: '7.1.2', regulatoryClause: 'INST-POL-HR §2.4 (placeholder)', guardRules: ['ensureExists'] },

  // --- Assets (AssetAssignment) ---
  { code: 'ASSET-001', name: 'Register New Asset', module: MODULES.ASSET, description: 'Add a new physical asset to the asset register.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-ASSET §1.1 (placeholder)', guardRules: ['ensureUnique'] },
  { code: 'ASSET-002', name: 'Assign Asset to Staff/Room', module: MODULES.ASSET, description: 'Assign an available asset to a staff member or room.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-ASSET §2.1 (placeholder)', guardRules: ['ensureAssetAvailable'] },
  { code: 'ASSET-003', name: 'Return/Reassign Asset', module: MODULES.ASSET, description: 'Return an assigned asset, making it available for reassignment.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-ASSET §2.2 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'ASSET-004', name: 'Report Asset Damage or Loss', module: MODULES.ASSET, description: 'Record that an assigned asset has been damaged or lost.', isoClause: '10.2.1', regulatoryClause: 'INST-POL-ASSET §2.3 (placeholder)', guardRules: ['ensureExists'] },
  { code: 'ASSET-005', name: 'Retire Asset from Service', module: MODULES.ASSET, description: 'Permanently retire an asset from the active register.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-ASSET §2.4 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },

  // --- Finance (FeeAccount) ---
  { code: 'FIN-001', name: 'Create Fee Account for Learner', module: MODULES.FINANCE, description: 'Open a fee account for a newly enrolled learner.', isoClause: '8.2.1', regulatoryClause: 'INST-POL-FIN §2.1 (placeholder)', guardRules: ['ensureUnique'] },
  { code: 'FIN-002', name: 'Record Fee Payment', module: MODULES.FINANCE, description: 'Record a payment received against a fee account.', isoClause: '8.2.1', regulatoryClause: 'INST-POL-FIN §2.2 (placeholder)', guardRules: ['ensureExists'] },
  { code: 'FIN-003', name: 'Flag Overdue Fee Account', module: MODULES.FINANCE, description: 'Mark a fee account as overdue when payment is outstanding past due date.', isoClause: '8.2.1', regulatoryClause: 'INST-POL-FIN §2.3 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'FIN-004', name: 'Issue Fee Waiver/Discount', module: MODULES.FINANCE, description: 'Apply an approved waiver or discount to a fee account balance.', isoClause: '8.2.1', regulatoryClause: 'INST-POL-FIN §2.4 (placeholder)', guardRules: ['ensureExists'] },
  { code: 'FIN-005', name: 'Close Fee Account on Completion/Withdrawal', module: MODULES.FINANCE, description: 'Close a fee account once fully settled or the learner withdraws.', isoClause: '8.2.1', regulatoryClause: 'INST-POL-FIN §2.5 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },

  // --- Facilities (Room) ---
  { code: 'FAC-001', name: 'Register New Room/Facility', module: MODULES.FACILITIES, description: 'Add a new room or facility to the facilities register.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-FAC §1.1 (placeholder)', guardRules: ['ensureUnique'] },
  { code: 'FAC-002', name: 'Book Room for Session', module: MODULES.FACILITIES, description: 'Reserve an available room for a scheduled session.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-FAC §2.1 (placeholder)', guardRules: ['ensureRoomAvailable'] },
  { code: 'FAC-003', name: 'Flag Room Under Maintenance', module: MODULES.FACILITIES, description: 'Mark a room unavailable while under maintenance.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-FAC §2.2 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'FAC-004', name: 'Release Room Booking', module: MODULES.FACILITIES, description: 'Release a room booking, returning the room to available status.', isoClause: '7.1.3', regulatoryClause: 'INST-POL-FAC §2.3 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },

  // --- Quality Management / General Compliance ---
  { code: 'QMS-001', name: 'Conduct Internal Audit', module: MODULES.QMS, description: 'Perform a scheduled internal audit of a process or department.', isoClause: '9.2.1', regulatoryClause: 'INST-POL-QMS §1.1 (placeholder)', guardRules: [] },
  { code: 'QMS-002', name: 'Record Nonconformity', module: MODULES.QMS, description: 'Log a nonconformity identified through audit or operations.', isoClause: '10.2.1', regulatoryClause: 'INST-POL-QMS §2.1 (placeholder)', guardRules: [] },
  { code: 'QMS-003', name: 'Raise Corrective Action Request (CAPA)', module: MODULES.QMS, description: 'Open a corrective action request against a recorded nonconformity.', isoClause: '10.2.1', regulatoryClause: 'INST-POL-QMS §2.2 (placeholder)', guardRules: ['ensureExists'] },
  { code: 'QMS-004', name: 'Close Corrective Action', module: MODULES.QMS, description: 'Close a corrective action once effectiveness is verified.', isoClause: '10.2.2', regulatoryClause: 'INST-POL-QMS §2.3 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'QMS-005', name: 'Conduct Management Review Meeting', module: MODULES.QMS, description: 'Hold a periodic management review of the QMS.', isoClause: '9.3.1', regulatoryClause: 'INST-POL-QMS §3.1 (placeholder)', guardRules: [] },
  { code: 'QMS-006', name: 'Perform Risk Assessment', module: MODULES.QMS, description: 'Assess risks and opportunities for a process, program, or project.', isoClause: '6.1.1', regulatoryClause: 'INST-POL-QMS §4.1 (placeholder)', guardRules: [] },
  { code: 'QMS-007', name: 'Control/Approve New Document Version', module: MODULES.QMS, description: 'Review and approve a new version of a controlled document.', isoClause: '7.5.2', regulatoryClause: 'INST-POL-QMS §5.1 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'QMS-008', name: 'Log Stakeholder Complaint', module: MODULES.QMS, description: 'Record a complaint raised by a learner, staff member, or vendor.', isoClause: '9.1.2', regulatoryClause: 'INST-POL-QMS §6.1 (placeholder)', guardRules: [] },

  // --- Library (Book, LoanRequest, Loan, BookReservation, BindingRequest, Fine) ---
  { code: 'UC-LIB-900', name: 'Add Book to Catalog', module: MODULES.LIBRARY, description: 'Register a new book, blocked if its catalog ID already exists.', isoClause: '8.5.1', regulatoryClause: 'INST-POL-LIB §1.1 (placeholder)', guardRules: ['assertDuplicateCatalogEntry'] },
  { code: 'UC-LIB-901', name: 'Submit/Approve Loan Request', module: MODULES.LIBRARY, description: 'Learner requests a book on loan; approval issues the loan.', isoClause: '8.2.1', regulatoryClause: 'INST-POL-LIB §2.1 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'UC-LIB-902', name: 'Issue and Return Loan', module: MODULES.LIBRARY, description: 'Issue a book on loan; return closes the loan and auto-calculates an overdue fine (return workflow corresponds to external ref UC-900-02-02).', isoClause: '8.5.1', regulatoryClause: 'INST-POL-LIB §2.2 (placeholder)', guardRules: ['assertNoOverdueLoans', 'assertBookNotDamaged'] },
  { code: 'UC-LIB-903', name: 'Reserve Book Slot', module: MODULES.LIBRARY, description: 'Reserve a book for a slot of at most 2 hours, blocked past 2 active reservations.', isoClause: '8.5.1', regulatoryClause: 'INST-POL-LIB §3.1 (placeholder)', guardRules: ['assertReservationLimit'] },
  { code: 'UC-LIB-904', name: 'Submit Binding Request', module: MODULES.LIBRARY, description: 'Send a book for binding/repair, taking it out of circulation until complete.', isoClause: '8.5.4', regulatoryClause: 'INST-POL-LIB §4.1 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'UC-LIB-905', name: 'Record Overdue Fine Payment/Waiver', module: MODULES.LIBRARY, description: 'Settle or waive a fine auto-calculated from an overdue return.', isoClause: '8.2.1', regulatoryClause: 'INST-POL-LIB §5.1 (placeholder)', guardRules: ['ensureStatusTransitionAllowed'] },
  { code: 'UC-LIB-906', name: 'Generate Overdue Loan Report', module: MODULES.LIBRARY, description: 'Query active loans past their due date, with computed days overdue.', isoClause: '9.1.3', regulatoryClause: 'INST-POL-LIB §6.1 (placeholder)', guardRules: [] },
];

module.exports = { MODULES, COMPLIANCE_STATUS, useCases };
