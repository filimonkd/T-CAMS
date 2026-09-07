const AnnualBudgetPlan = require('../../models/budget/AnnualBudgetPlan');
const { createReportController } = require('../reportControllerFactory');

// UC-ADMIN-FIN-002: Annual Budget Plan, Finance chain (Finance Officer -> Auditor -> Bureau).
module.exports = createReportController(AnnualBudgetPlan, 'FINANCE');
