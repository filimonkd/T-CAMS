const AnnualBudgetPlan = require('../../models/budget/AnnualBudgetPlan');
const { createReportController } = require('../reportControllerFactory');

// UC-ADMIN-RPB-002: Annual Budget Plan, RPB chain (Budget Officer -> Bureau).
module.exports = createReportController(AnnualBudgetPlan, 'RPB');
