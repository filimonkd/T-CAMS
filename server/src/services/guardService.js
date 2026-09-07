/**
 * guardService
 *
 * Reusable "blocking rule" primitives referenced by the `guardRules` field
 * of entries in config/useCases.js. Each primitive throws a GuardError when
 * the condition it protects is violated; callers (controllers/services) are
 * expected to catch GuardError and translate it into an HTTP 4xx response.
 */

class GuardError extends Error {
  constructor(message, code = 'GUARD_BLOCKED', statusCode = 422) {
    super(message);
    this.name = 'GuardError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function ensure(condition, message, code) {
  if (!condition) {
    throw new GuardError(message, code);
  }
}

function ensureExists(doc, entityName = 'Record') {
  ensure(Boolean(doc), `${entityName} not found.`, 'NOT_FOUND');
  return doc;
}

function ensureUnique(existingDoc, entityName = 'Record', field = 'value') {
  ensure(!existingDoc, `${entityName} with this ${field} already exists.`, 'DUPLICATE');
}

function ensureStatusTransitionAllowed(currentStatus, allowedFromStatuses, targetStatus) {
  ensure(
    allowedFromStatuses.includes(currentStatus),
    `Cannot move from status "${currentStatus}" to "${targetStatus}".`,
    'INVALID_STATUS_TRANSITION',
  );
}

function ensureSufficientBudget(allocation, amount) {
  ensureExists(allocation, 'Budget allocation');
  const remaining = allocation.allocatedAmount - allocation.spentAmount;
  ensure(
    remaining >= amount,
    `Insufficient budget: requested ${amount}, remaining ${remaining}.`,
    'INSUFFICIENT_BUDGET',
  );
}

function ensureSufficientStock(stockItem, quantity) {
  ensureExists(stockItem, 'Stock item');
  ensure(
    stockItem.quantityOnHand >= quantity,
    `Insufficient stock: requested ${quantity}, on hand ${stockItem.quantityOnHand}.`,
    'INSUFFICIENT_STOCK',
  );
}

function ensureCapacityAvailable(currentCount, capacity, entityName = 'Section') {
  ensure(
    currentCount < capacity,
    `${entityName} is at full capacity (${capacity}).`,
    'CAPACITY_EXCEEDED',
  );
}

function ensureSufficientLeaveBalance(leaveBalance, days) {
  ensureExists(leaveBalance, 'Leave balance');
  const available = leaveBalance.entitledDays + leaveBalance.carriedOverDays - leaveBalance.usedDays;
  ensure(
    available >= days,
    `Insufficient leave balance: requested ${days}, available ${available}.`,
    'INSUFFICIENT_LEAVE_BALANCE',
  );
}

function ensureAssetAvailable(asset) {
  ensureExists(asset, 'Asset');
  ensure(asset.status === 'AVAILABLE', `Asset is not available (status: ${asset.status}).`, 'ASSET_UNAVAILABLE');
}

function ensureRoomAvailable(room) {
  ensureExists(room, 'Room');
  ensure(room.status === 'AVAILABLE', `Room is not available (status: ${room.status}).`, 'ROOM_UNAVAILABLE');
}

/**
 * Validates a status transition (see ensureStatusTransitionAllowed) and then
 * applies it to `doc[field]`. Callers must run any assert-/ensure- prefixed
 * blocking rules for the action BEFORE calling transitionStatus, since this only
 * checks that the transition itself is legal, not the business rules around
 * it (e.g. assertNoOverdueLoans must be checked before transitioning a Loan
 * to ACTIVE, not by this function).
 */
function transitionStatus(doc, field, allowedFromStatuses, targetStatus) {
  ensureStatusTransitionAllowed(doc[field], allowedFromStatuses, targetStatus);
  doc[field] = targetStatus;
  return doc;
}

// --- Library module guards ---

function assertNoOverdueLoans(overdueLoanCount, entityName = 'Learner') {
  ensure(
    overdueLoanCount === 0,
    `${entityName} has ${overdueLoanCount} overdue loan(s) and cannot proceed until they are returned.`,
    'OVERDUE_LOANS_OUTSTANDING',
  );
}

function assertBookNotDamaged(book) {
  ensureExists(book, 'Book');
  const condition = book.bookCard && book.bookCard.condition;
  ensure(
    condition !== 'POOR' && condition !== 'DAMAGED',
    `Book is not loanable (condition: ${condition}).`,
    'BOOK_NOT_LOANABLE',
  );
}

function assertReservationLimit(activeReservationCount, limit = 2) {
  ensure(
    activeReservationCount < limit,
    `Learner already has ${activeReservationCount} active reservations (limit ${limit}).`,
    'RESERVATION_LIMIT_REACHED',
  );
}

function assertDuplicateCatalogEntry(existingBook) {
  ensureUnique(existingBook, 'Book', 'catalogId');
}

// --- Department module guards ---

function assertSectionCapacity(section) {
  ensureExists(section, 'Section');
  ensure(
    section.enrolledCount < section.capacity,
    `Section is at full capacity (${section.capacity}).`,
    'SECTION_AT_CAPACITY',
  );
}

function assertTrainerLoad(trainer, additionalHours) {
  ensureExists(trainer, 'Trainer');
  const projectedHours = trainer.scheduledHours + additionalHours;
  ensure(
    projectedHours <= trainer.contractHourLimit,
    `Trainer contract hour limit exceeded: ${projectedHours}/${trainer.contractHourLimit} hours.`,
    'TRAINER_OVERLOADED',
  );
}

function assertStockAvailability(stockItem, quantityRequested) {
  ensureExists(stockItem, 'Stock item');
  ensure(
    quantityRequested <= stockItem.quantityOnHand,
    `Insufficient stock: requested ${quantityRequested}, on hand ${stockItem.quantityOnHand}.`,
    'INSUFFICIENT_STOCK',
  );
}

function assertBudgetAvailability(allocation, amount) {
  ensureExists(allocation, 'Budget allocation');
  const remaining = allocation.allocatedAmount - allocation.spentAmount;
  ensure(
    remaining >= amount,
    `Insufficient budget: requested ${amount}, remaining ${remaining}.`,
    'INSUFFICIENT_BUDGET',
  );
}

function assertRoomCapacity(room, cohortSize) {
  ensureExists(room, 'Room');
  ensure(
    cohortSize <= room.capacity,
    `Exam cohort of ${cohortSize} exceeds room capacity (${room.capacity}).`,
    'ROOM_CAPACITY_EXCEEDED',
  );
}

module.exports = {
  GuardError,
  ensure,
  ensureExists,
  ensureUnique,
  ensureStatusTransitionAllowed,
  ensureSufficientBudget,
  ensureSufficientStock,
  ensureCapacityAvailable,
  ensureSufficientLeaveBalance,
  ensureAssetAvailable,
  ensureRoomAvailable,
  transitionStatus,
  assertNoOverdueLoans,
  assertBookNotDamaged,
  assertReservationLimit,
  assertDuplicateCatalogEntry,
  assertSectionCapacity,
  assertTrainerLoad,
  assertStockAvailability,
  assertBudgetAvailability,
  assertRoomCapacity,
};
