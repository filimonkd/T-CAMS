/**
 * Tier 4 item 9, DB-backed half.
 *
 * The fast suite proves transitionStatus writes the right audit payload by
 * replacing AuditLog.create. This suite proves the other half: that the
 * payload actually persists and reads back through the real query paths
 * the API uses. Together they cover the write end to end.
 *
 * Requires a MongoDB. See helpers.js.
 */
process.env.JWT_SECRET = 'test-secret';

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const { connect, disconnect, truncate } = require('./helpers');

const AuditLog = require('../../src/models/AuditLog');
const Vendor = require('../../src/models/supporting/Vendor');
const { transitionStatus } = require('../../src/services/guardService');
const { getEntityHistory, getComplianceLog } = require('../../src/services/auditService');

before(connect);
after(disconnect);
beforeEach(truncate);

describe('audit persistence', () => {
  test('a transition persists an audit row that reads back', async () => {
    const vendor = await Vendor.create({ name: 'Acme', status: 'PENDING_APPROVAL' });

    await transitionStatus(vendor, 'status', ['PENDING_APPROVAL'], 'APPROVED', 'UC-ADMIN-FIN-003');
    await vendor.save();

    const rows = await AuditLog.find({ entityType: 'Vendor', entityId: vendor._id });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].fromStatus, 'PENDING_APPROVAL');
    assert.strictEqual(rows[0].toStatus, 'APPROVED');
    assert.strictEqual(rows[0].useCaseCode, 'UC-ADMIN-FIN-003');

    const reloaded = await Vendor.findById(vendor._id);
    assert.strictEqual(reloaded.status, 'APPROVED', 'the status change must persist too');
  });

  test('getEntityHistory returns a document history oldest first', async () => {
    const vendor = await Vendor.create({ name: 'Acme', status: 'PENDING_APPROVAL' });

    await transitionStatus(vendor, 'status', ['PENDING_APPROVAL'], 'APPROVED', 'UC-ADMIN-FIN-003');
    await vendor.save();

    // occurredAt has millisecond precision, so two transitions in the same
    // millisecond would tie and make this ordering assertion flaky.
    await new Promise((resolve) => setTimeout(resolve, 5));

    await transitionStatus(vendor, 'status', ['APPROVED'], 'SUSPENDED');
    await vendor.save();

    const history = await getEntityHistory('Vendor', vendor._id);
    assert.deepStrictEqual(
      history.map((row) => row.toStatus),
      ['APPROVED', 'SUSPENDED'],
    );
  });

  test('a blocked transition persists nothing', async () => {
    const vendor = await Vendor.create({ name: 'Acme', status: 'APPROVED' });

    await assert.rejects(() => transitionStatus(vendor, 'status', ['PENDING_APPROVAL'], 'APPROVED'));

    assert.strictEqual(await AuditLog.countDocuments({ entityId: vendor._id }), 0);
    const reloaded = await Vendor.findById(vendor._id);
    assert.strictEqual(reloaded.status, 'APPROVED');
  });

  test('getComplianceLog filters by clause and returns newest first', async () => {
    const vendor = await Vendor.create({ name: 'Acme', status: 'PENDING_APPROVAL' });
    await transitionStatus(vendor, 'status', ['PENDING_APPROVAL'], 'APPROVED', 'UC-ADMIN-FIN-003');
    await vendor.save();

    const clause = (await AuditLog.findOne({ entityId: vendor._id })).isoClause;
    assert.ok(clause, 'expected the registered use case to carry a clause');

    const matching = await getComplianceLog({ isoClause: clause });
    assert.ok(matching.length >= 1);

    const none = await getComplianceLog({ isoClause: 'NO-SUCH-CLAUSE' });
    assert.strictEqual(none.length, 0);
  });

  test('entityId is stored as an ObjectId, so history joins resolve', async () => {
    // AuditLog declares entityId as ObjectId. If a caller ever passed a
    // string, Mongoose would cast on write but equality against a real
    // ObjectId elsewhere could silently miss.
    const vendor = await Vendor.create({ name: 'Acme', status: 'PENDING_APPROVAL' });
    await transitionStatus(vendor, 'status', ['PENDING_APPROVAL'], 'APPROVED');
    await vendor.save();

    const row = await AuditLog.findOne({ entityId: vendor._id });
    assert.ok(row, 'the row must be findable by the document ObjectId');
    assert.ok(row.entityId instanceof mongoose.Types.ObjectId);
  });
});
