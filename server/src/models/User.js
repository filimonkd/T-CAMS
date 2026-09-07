const mongoose = require('mongoose');

/**
 * ROLE NOTE: the original 6 roles (ADMIN, REGISTRAR, PROCUREMENT_OFFICER,
 * HR_OFFICER, FINANCE_OFFICER, AUDITOR) from Phase 2's Role.js don't cover
 * every role the Phase 10 seed spec asks for (library_officer,
 * department_head, budget_officer, advisor). Rather than seed users whose
 * role never matches any client/src/config/moduleConfig.js group - which
 * would render an empty sidebar for those demo logins - this adds four
 * roles: LIBRARY_OFFICER, DEPARTMENT_HEAD, BUDGET_OFFICER, ADVISOR. See the
 * matching moduleConfig.js update in this same PR.
 */
const ROLE_NAMES = [
  'ADMIN',
  'REGISTRAR',
  'PROCUREMENT_OFFICER',
  'HR_OFFICER',
  'FINANCE_OFFICER',
  'AUDITOR',
  'LIBRARY_OFFICER',
  'DEPARTMENT_HEAD',
  'BUDGET_OFFICER',
  'ADVISOR',
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ROLE_NAMES },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
module.exports.ROLE_NAMES = ROLE_NAMES;
