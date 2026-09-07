/**
 * Seeds baseline roles and a small set of initial supporting data so the
 * Phase 2 foundation can be exercised end-to-end. Safe to re-run: existing
 * documents are matched by their natural key and left untouched.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

const { connectDB } = require('../server/src/config/db');
const Role = require('../server/src/models/Role');
const Vendor = require('../server/src/models/supporting/Vendor');
const Program = require('../server/src/models/supporting/Program');
const Course = require('../server/src/models/supporting/Course');
const Room = require('../server/src/models/supporting/Room');

const ROLES = [
  { name: 'ADMIN', description: 'Full system access', permissions: ['*'] },
  { name: 'REGISTRAR', description: 'Manages programs, courses, sections and enrollment', permissions: ['ACADEMIC:*'] },
  { name: 'PROCUREMENT_OFFICER', description: 'Manages vendors, stock and budget allocations', permissions: ['PROCUREMENT:*'] },
  { name: 'HR_OFFICER', description: 'Manages staff leave balances', permissions: ['HR:*'] },
  { name: 'FINANCE_OFFICER', description: 'Manages fee accounts', permissions: ['FINANCE:*'] },
  { name: 'AUDITOR', description: 'Read-only access for internal audits and QMS records', permissions: ['QMS:READ', 'AUDIT:READ'] },
];

async function seedRoles() {
  for (const role of ROLES) {
    await Role.findOneAndUpdate({ name: role.name }, role, { upsert: true, new: true });
  }
  console.log(`Seeded ${ROLES.length} roles.`);
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

  const courseExists = await Course.findOne({ title: 'Orientation', program: program._id });
  if (!courseExists) {
    await Course.create({ program: program._id, title: 'Orientation', credits: 1 });
  }

  const roomExists = await Room.findOne({ name: 'Room 101' });
  if (!roomExists) {
    await Room.create({ name: 'Room 101', building: 'Main Building', capacity: 30 });
  }

  console.log('Seeded initial supporting data (vendor, program, course, room).');
}

async function run() {
  await connectDB();
  await seedRoles();
  await seedSupportingData();
  console.log('Seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
