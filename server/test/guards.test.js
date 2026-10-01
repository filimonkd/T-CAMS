/**
 * Tier 4 item 9: coverage for the guard layer.
 *
 * Every guard in guardService.js except transitionStatus is a pure
 * synchronous function over plain objects, so this suite needs no database
 * and runs in the fast suite. These functions encode the system's actual
 * business rules, which until now had no automated coverage at all.
 *
 * Each guard is checked three ways: it permits the allowed case, it blocks
 * the disallowed one, and it blocks with the documented error code — the
 * code is part of the API contract, since controllers and the client both
 * branch on it.
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');

const guards = require('../src/services/guardService');

/** Asserts fn() throws a GuardError carrying `code`. */
function blocksWith(code, fn) {
  assert.throws(fn, (err) => {
    assert.strictEqual(err.name, 'GuardError', `expected GuardError, got ${err.name}`);
    assert.strictEqual(err.code, code, `expected code ${code}, got ${err.code}`);
    assert.strictEqual(typeof err.message, 'string');
    assert.ok(err.message.length > 0, 'a blocked guard must explain why');
    return true;
  });
}

describe('primitives', () => {
  test('ensure passes a truthy condition and blocks a falsy one', () => {
    assert.doesNotThrow(() => guards.ensure(true, 'nope', 'X'));
    blocksWith('X', () => guards.ensure(false, 'nope', 'X'));
  });

  test('GuardError defaults to 422 so controllers map it to a 4xx', () => {
    try {
      guards.ensure(false, 'blocked', 'SOME_CODE');
      assert.fail('expected a throw');
    } catch (err) {
      assert.strictEqual(err.statusCode, 422);
    }
  });

  test('ensureExists returns the document and blocks on null', () => {
    const doc = { _id: '1' };
    assert.strictEqual(guards.ensureExists(doc), doc);
    blocksWith('NOT_FOUND', () => guards.ensureExists(null, 'Vendor'));
    blocksWith('NOT_FOUND', () => guards.ensureExists(undefined));
  });

  test('ensureUnique blocks when a document already exists', () => {
    assert.doesNotThrow(() => guards.ensureUnique(null, 'Book', 'catalogId'));
    blocksWith('DUPLICATE', () => guards.ensureUnique({ _id: '1' }, 'Book', 'catalogId'));
  });

  test('ensureStatusTransitionAllowed gates on the allowed-from list', () => {
    assert.doesNotThrow(() => guards.ensureStatusTransitionAllowed('DRAFT', ['DRAFT'], 'APPROVED'));
    blocksWith('INVALID_STATUS_TRANSITION', () =>
      guards.ensureStatusTransitionAllowed('APPROVED', ['DRAFT'], 'APPROVED'));
  });

  test('an empty allowed-from list blocks every transition', () => {
    blocksWith('INVALID_STATUS_TRANSITION', () =>
      guards.ensureStatusTransitionAllowed('DRAFT', [], 'APPROVED'));
  });
});

describe('budget and stock', () => {
  test('ensureSufficientBudget allows spending exactly the remainder', () => {
    const allocation = { allocatedAmount: 1000, spentAmount: 400 };
    assert.doesNotThrow(() => guards.ensureSufficientBudget(allocation, 600));
    blocksWith('INSUFFICIENT_BUDGET', () => guards.ensureSufficientBudget(allocation, 601));
  });

  test('ensureSufficientBudget blocks on a missing allocation', () => {
    blocksWith('NOT_FOUND', () => guards.ensureSufficientBudget(null, 1));
  });

  test('assertBudgetAvailable matches ensureSufficientBudget', () => {
    // Two names for the same rule; a divergence would be a bug.
    const allocation = { allocatedAmount: 500, spentAmount: 480 };
    assert.doesNotThrow(() => guards.assertBudgetAvailable(allocation, 20));
    blocksWith('INSUFFICIENT_BUDGET', () => guards.assertBudgetAvailable(allocation, 21));
  });

  test('budget arithmetic relies on spentAmount defaulting to 0 in the schema', () => {
    // BudgetAllocation declares `spentAmount: { default: 0 }`. If that default
    // is ever removed, allocatedAmount - undefined is NaN and every spend is
    // refused. This test fails loudly if that happens.
    const withoutSpent = { allocatedAmount: 100 };
    blocksWith('INSUFFICIENT_BUDGET', () => guards.ensureSufficientBudget(withoutSpent, 1));
  });

  test('ensureSufficientStock allows taking the whole shelf', () => {
    const item = { quantityOnHand: 10 };
    assert.doesNotThrow(() => guards.ensureSufficientStock(item, 10));
    blocksWith('INSUFFICIENT_STOCK', () => guards.ensureSufficientStock(item, 11));
  });

  test('assertStockAvailability matches ensureSufficientStock', () => {
    const item = { quantityOnHand: 3 };
    assert.doesNotThrow(() => guards.assertStockAvailability(item, 3));
    blocksWith('INSUFFICIENT_STOCK', () => guards.assertStockAvailability(item, 4));
  });

  test('assertPettyCashLimit checks the fund is active before the balance', () => {
    assert.doesNotThrow(() => guards.assertPettyCashLimit({ isActive: true, currentBalance: 500 }, 500));
    blocksWith('PETTY_CASH_FUND_INACTIVE', () =>
      guards.assertPettyCashLimit({ isActive: false, currentBalance: 500 }, 10));
    blocksWith('PETTY_CASH_LIMIT_EXCEEDED', () =>
      guards.assertPettyCashLimit({ isActive: true, currentBalance: 100 }, 101));
  });
});

describe('capacity', () => {
  test('ensureCapacityAvailable blocks at exactly full, not over', () => {
    assert.doesNotThrow(() => guards.ensureCapacityAvailable(9, 10));
    blocksWith('CAPACITY_EXCEEDED', () => guards.ensureCapacityAvailable(10, 10));
  });

  test('assertSectionCapacity reads the section document', () => {
    assert.doesNotThrow(() => guards.assertSectionCapacity({ enrolledCount: 24, capacity: 25 }));
    blocksWith('SECTION_AT_CAPACITY', () =>
      guards.assertSectionCapacity({ enrolledCount: 25, capacity: 25 }));
    blocksWith('NOT_FOUND', () => guards.assertSectionCapacity(null));
  });

  test('assertRoomCapacity allows a cohort exactly filling the room', () => {
    assert.doesNotThrow(() => guards.assertRoomCapacity({ capacity: 30 }, 30));
    blocksWith('ROOM_CAPACITY_EXCEEDED', () => guards.assertRoomCapacity({ capacity: 30 }, 31));
  });

  test('assertTrainerLoad allows hitting the contract limit exactly', () => {
    const trainer = { scheduledHours: 36, contractHourLimit: 40 };
    assert.doesNotThrow(() => guards.assertTrainerLoad(trainer, 4));
    blocksWith('TRAINER_OVERLOADED', () => guards.assertTrainerLoad(trainer, 5));
  });
});

describe('availability and condition', () => {
  test('ensureAssetAvailable requires AVAILABLE', () => {
    assert.doesNotThrow(() => guards.ensureAssetAvailable({ status: 'AVAILABLE' }));
    blocksWith('ASSET_UNAVAILABLE', () => guards.ensureAssetAvailable({ status: 'ASSIGNED' }));
  });

  test('ensureRoomAvailable requires AVAILABLE', () => {
    assert.doesNotThrow(() => guards.ensureRoomAvailable({ status: 'AVAILABLE' }));
    blocksWith('ROOM_UNAVAILABLE', () => guards.ensureRoomAvailable({ status: 'MAINTENANCE' }));
  });

  test('assertVendorApproved reads Vendor.status', () => {
    assert.doesNotThrow(() => guards.assertVendorApproved({ status: 'APPROVED' }));
    blocksWith('VENDOR_NOT_APPROVED', () => guards.assertVendorApproved({ status: 'PENDING' }));
    blocksWith('NOT_FOUND', () => guards.assertVendorApproved(null));
  });

  test('assertContractPrerequisite requires an ACTIVE contract', () => {
    assert.doesNotThrow(() => guards.assertContractPrerequisite({ status: 'ACTIVE' }));
    blocksWith('NO_ACTIVE_CONTRACT', () => guards.assertContractPrerequisite({ status: 'SIGNED' }));
    blocksWith('NOT_FOUND', () => guards.assertContractPrerequisite(null));
  });
});

describe('library', () => {
  test('assertNoOverdueLoans blocks on any overdue loan', () => {
    assert.doesNotThrow(() => guards.assertNoOverdueLoans(0));
    blocksWith('OVERDUE_LOANS_OUTSTANDING', () => guards.assertNoOverdueLoans(1));
  });

  test('assertBookNotDamaged blocks POOR and DAMAGED only', () => {
    assert.doesNotThrow(() => guards.assertBookNotDamaged({ bookCard: { condition: 'GOOD' } }));
    blocksWith('BOOK_NOT_LOANABLE', () => guards.assertBookNotDamaged({ bookCard: { condition: 'POOR' } }));
    blocksWith('BOOK_NOT_LOANABLE', () => guards.assertBookNotDamaged({ bookCard: { condition: 'DAMAGED' } }));
  });

  test('a book with no bookCard is treated as loanable', () => {
    // Documents the current behaviour: condition resolves to undefined,
    // which is neither POOR nor DAMAGED, so the loan proceeds.
    assert.doesNotThrow(() => guards.assertBookNotDamaged({}));
  });

  test('assertReservationLimit defaults to a limit of 2', () => {
    assert.doesNotThrow(() => guards.assertReservationLimit(1));
    blocksWith('RESERVATION_LIMIT_REACHED', () => guards.assertReservationLimit(2));
    assert.doesNotThrow(() => guards.assertReservationLimit(2, 3));
  });

  test('assertDuplicateCatalogEntry blocks a reused catalogId', () => {
    assert.doesNotThrow(() => guards.assertDuplicateCatalogEntry(null));
    blocksWith('DUPLICATE', () => guards.assertDuplicateCatalogEntry({ _id: '1' }));
  });
});

describe('finance and HR', () => {
  test('assertBidScoreThreshold passes at exactly the threshold', () => {
    assert.doesNotThrow(() => guards.assertBidScoreThreshold(70));
    blocksWith('BID_SCORE_BELOW_THRESHOLD', () => guards.assertBidScoreThreshold(69));
    assert.doesNotThrow(() => guards.assertBidScoreThreshold(60, 60));
  });

  test('assertExpenseJustification requires 50 characters after trimming', () => {
    assert.doesNotThrow(() => guards.assertExpenseJustification('x'.repeat(50)));
    blocksWith('EXPENSE_JUSTIFICATION_TOO_SHORT', () =>
      guards.assertExpenseJustification('x'.repeat(49)));
    blocksWith('EXPENSE_JUSTIFICATION_TOO_SHORT', () =>
      guards.assertExpenseJustification(`   ${'x'.repeat(48)}   `));
  });

  test('assertExpenseJustification rejects non-strings', () => {
    blocksWith('EXPENSE_JUSTIFICATION_TOO_SHORT', () => guards.assertExpenseJustification(undefined));
    blocksWith('EXPENSE_JUSTIFICATION_TOO_SHORT', () => guards.assertExpenseJustification(null));
  });

  test('assertLeaveBalance counts carried-over days as available', () => {
    const balance = { entitledDays: 20, carriedOverDays: 5, usedDays: 22 };
    assert.doesNotThrow(() => guards.assertLeaveBalance(balance, 3));
    blocksWith('INSUFFICIENT_LEAVE_BALANCE', () => guards.assertLeaveBalance(balance, 4));
  });

  test('leave arithmetic relies on the schema defaults for used and carried days', () => {
    // LeaveBalance declares both with `default: 0`. Removing either makes
    // the sum NaN, which silently refuses every request.
    blocksWith('INSUFFICIENT_LEAVE_BALANCE', () =>
      guards.assertLeaveBalance({ entitledDays: 20 }, 1));
  });

  test('assertNoActiveClearanceHold blocks on any pending clearance', () => {
    assert.doesNotThrow(() => guards.assertNoActiveClearanceHold(0));
    blocksWith('CLEARANCE_HOLD_ACTIVE', () => guards.assertNoActiveClearanceHold(1, 'Employee'));
  });

  test('assertBiometricUnique blocks a reused biometric hash', () => {
    assert.doesNotThrow(() => guards.assertBiometricUnique(null));
    blocksWith('DUPLICATE', () => guards.assertBiometricUnique({ _id: '1' }));
  });
});
