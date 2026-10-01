/**
 * Tier 4 item 9: coverage for transitionStatus and the approval chains.
 *
 * These are the two highest-blast-radius pieces of logic in the system:
 * transitionStatus is the single choke point every status change in all 44
 * entities passes through, and it is the only place audit entries are
 * written from.
 *
 * No database is needed. transitionStatus reaches Mongo only through
 * auditService -> AuditLog.create, and `create` is looked up on the model
 * object at call time, so replacing that one method isolates the whole path
 * and lets the suite assert on exactly what WOULD have been written.
 *
 * advanceReport/rejectReport take the Model as a parameter, so a stub stands
 * in for it directly.
 */
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

require('mongoose').set('bufferCommands', false);

const AuditLog = require('../src/models/AuditLog');
const { transitionStatus } = require('../src/services/guardService');
const { APPROVAL_CHAINS, advanceReport, rejectReport } = require('../src/services/approvalChainService');

let written;
let realCreate;

beforeEach(() => {
  written = [];
  realCreate = AuditLog.create;
  AuditLog.create = async (entry) => {
    written.push(entry);
    return entry;
  };
});

afterEach(() => {
  AuditLog.create = realCreate;
});

/** A plain stand-in for a Mongoose document. */
function fakeDoc({ modelName = 'Vendor', status = 'DRAFT', approvalChain, _id = 'doc-1' } = {}) {
  return {
    _id,
    status,
    approvalChain,
    saved: 0,
    constructor: { modelName },
    async save() {
      this.saved += 1;
      return this;
    },
  };
}

/** A stand-in for a Mongoose Model, as advanceReport/rejectReport use it. */
function fakeModel(modelName, doc) {
  return { modelName, findById: async () => doc };
}

describe('transitionStatus', () => {
  test('applies a legal transition to the named field', async () => {
    const doc = fakeDoc({ status: 'DRAFT' });
    await transitionStatus(doc, 'status', ['DRAFT'], 'APPROVED', 'UC-ADMIN-RPB-001');
    assert.strictEqual(doc.status, 'APPROVED');
  });

  test('blocks a transition from a status not in the allowed list', async () => {
    const doc = fakeDoc({ status: 'APPROVED' });
    await assert.rejects(
      () => transitionStatus(doc, 'status', ['DRAFT'], 'APPROVED'),
      (err) => err.code === 'INVALID_STATUS_TRANSITION',
    );
  });

  test('leaves the document unchanged when it blocks', async () => {
    const doc = fakeDoc({ status: 'APPROVED' });
    await assert.rejects(() => transitionStatus(doc, 'status', ['DRAFT'], 'REJECTED'));
    assert.strictEqual(doc.status, 'APPROVED', 'a blocked transition must not mutate the document');
    assert.strictEqual(written.length, 0, 'a blocked transition must not write an audit entry');
  });

  test('writes exactly one audit entry per successful transition', async () => {
    const doc = fakeDoc({ status: 'DRAFT' });
    await transitionStatus(doc, 'status', ['DRAFT'], 'APPROVED', 'UC-ADMIN-RPB-001');
    assert.strictEqual(written.length, 1);
  });

  test('the audit entry records the from and to statuses and the entity', async () => {
    const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'DRAFT', _id: 'report-9' });
    await transitionStatus(doc, 'status', ['DRAFT'], 'BUREAU_REVIEW', 'UC-ADMIN-RPB-001');

    assert.deepStrictEqual(
      {
        entityType: written[0].entityType,
        entityId: written[0].entityId,
        fromStatus: written[0].fromStatus,
        toStatus: written[0].toStatus,
      },
      {
        entityType: 'MonthlyBudgetReport',
        entityId: 'report-9',
        fromStatus: 'DRAFT',
        toStatus: 'BUREAU_REVIEW',
      },
    );
  });

  test('a known use-case code is resolved to its clauses', async () => {
    const doc = fakeDoc({ status: 'DRAFT' });
    await transitionStatus(doc, 'status', ['DRAFT'], 'APPROVED', 'UC-ADMIN-RPB-001');

    assert.strictEqual(written[0].useCaseCode, 'UC-ADMIN-RPB-001');
    assert.ok(written[0].isoClause, 'a registered use case must carry an isoClause');
  });

  test('an omitted use-case code still records the transition, unattributed', async () => {
    const doc = fakeDoc({ status: 'ENROLLED' });
    await transitionStatus(doc, 'status', ['ENROLLED'], 'WITHDRAWN');

    assert.strictEqual(written.length, 1);
    assert.strictEqual(written[0].useCaseCode, undefined);
    assert.strictEqual(written[0].isoClause, undefined);
  });

  test('an unknown use-case code records without clauses rather than throwing', async () => {
    const doc = fakeDoc({ status: 'DRAFT' });
    await transitionStatus(doc, 'status', ['DRAFT'], 'APPROVED', 'UC-DOES-NOT-EXIST');

    assert.strictEqual(written[0].useCaseCode, 'UC-DOES-NOT-EXIST');
    assert.strictEqual(written[0].isoClause, undefined);
  });

  test('operates on whichever field it is given, not just status', async () => {
    const doc = fakeDoc();
    doc.clearanceState = 'PENDING';
    await transitionStatus(doc, 'clearanceState', ['PENDING'], 'CLEARED');

    assert.strictEqual(doc.clearanceState, 'CLEARED');
    assert.strictEqual(doc.status, 'DRAFT', 'the status field must be untouched');
  });
});

describe('approval chains', () => {
  test('the RPB chain advances one stage at a time to APPROVED', async () => {
    const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'DRAFT', approvalChain: 'RPB' });
    const Model = fakeModel('MonthlyBudgetReport', doc);

    const reached = [];
    for (let i = 0; i < APPROVAL_CHAINS.RPB.length - 1; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await advanceReport(Model, doc._id);
      reached.push(doc.status);
    }

    assert.deepStrictEqual(reached, ['BUDGET_OFFICER_REVIEW', 'BUREAU_REVIEW', 'APPROVED']);
    assert.strictEqual(written.length, 3, 'each stage writes one audit entry');
  });

  test('the FINANCE chain has its own longer sequence', async () => {
    const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'DRAFT', approvalChain: 'FINANCE' });
    const Model = fakeModel('MonthlyBudgetReport', doc);

    const reached = [];
    for (let i = 0; i < APPROVAL_CHAINS.FINANCE.length - 1; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await advanceReport(Model, doc._id);
      reached.push(doc.status);
    }

    assert.deepStrictEqual(reached, [
      'FINANCE_OFFICER_REVIEW',
      'AUDITOR_REVIEW',
      'BUREAU_REVIEW',
      'APPROVED',
    ]);
  });

  test('REGRESSION: advancing an already-APPROVED report is refused', async () => {
    // The Phase 6 defect. `[doc.status]` as the allowed-from list trivially
    // matches the document's own status, so without the bounds check in
    // advanceReport, transitionStatus would never block this and status
    // would be set to undefined.
    const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'APPROVED', approvalChain: 'RPB' });
    const Model = fakeModel('MonthlyBudgetReport', doc);

    await assert.rejects(
      () => advanceReport(Model, doc._id),
      (err) => err.code === 'INVALID_STATUS_TRANSITION',
    );
    assert.strictEqual(doc.status, 'APPROVED', 'the terminal status must survive');
    assert.strictEqual(written.length, 0);
  });

  test('REGRESSION: a REJECTED report cannot be revived by advancing it', async () => {
    // REJECTED sits outside the forward chain, so indexOf returns -1.
    const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'REJECTED', approvalChain: 'RPB' });
    const Model = fakeModel('MonthlyBudgetReport', doc);

    await assert.rejects(
      () => advanceReport(Model, doc._id),
      (err) => err.code === 'INVALID_STATUS_TRANSITION',
    );
    assert.strictEqual(doc.status, 'REJECTED');
  });

  test('advanceReport blocks on a missing document', async () => {
    const Model = { modelName: 'MonthlyBudgetReport', findById: async () => null };
    await assert.rejects(() => advanceReport(Model, 'nope'), (err) => err.code === 'NOT_FOUND');
  });

  test('rejectReport works from any review stage', async () => {
    const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'BUREAU_REVIEW', approvalChain: 'RPB' });
    await rejectReport(fakeModel('MonthlyBudgetReport', doc), doc._id);

    assert.strictEqual(doc.status, 'REJECTED');
    assert.strictEqual(written[0].toStatus, 'REJECTED');
  });

  test('rejectReport cannot reject a DRAFT or an APPROVED report', async () => {
    // reviewStages is chain.slice(1, -1), so the first and last stages are
    // excluded by design: nothing has been submitted yet, or it is final.
    for (const status of ['DRAFT', 'APPROVED']) {
      const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status, approvalChain: 'RPB' });
      // eslint-disable-next-line no-await-in-loop
      await assert.rejects(
        () => rejectReport(fakeModel('MonthlyBudgetReport', doc), doc._id),
        (err) => err.code === 'INVALID_STATUS_TRANSITION',
        `expected ${status} to be unrejectable`,
      );
    }
  });

  test('each chain variant is attributed to its own use-case code', async () => {
    const rpb = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'DRAFT', approvalChain: 'RPB' });
    await advanceReport(fakeModel('MonthlyBudgetReport', rpb), rpb._id);
    const rpbCode = written[0].useCaseCode;

    written = [];
    const fin = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'DRAFT', approvalChain: 'FINANCE' });
    await advanceReport(fakeModel('MonthlyBudgetReport', fin), fin._id);

    assert.strictEqual(rpbCode, 'UC-ADMIN-RPB-001');
    assert.strictEqual(written[0].useCaseCode, 'UC-ADMIN-FIN-001');
  });

  test('a successful advance persists the document', async () => {
    const doc = fakeDoc({ modelName: 'MonthlyBudgetReport', status: 'DRAFT', approvalChain: 'RPB' });
    await advanceReport(fakeModel('MonthlyBudgetReport', doc), doc._id);
    assert.strictEqual(doc.saved, 1, 'advanceReport must save the document it mutated');
  });
});
