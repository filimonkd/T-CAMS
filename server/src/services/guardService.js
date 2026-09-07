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
};
