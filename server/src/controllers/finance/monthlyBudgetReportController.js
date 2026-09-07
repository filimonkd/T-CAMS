const MonthlyBudgetReport = require('../../models/budget/MonthlyBudgetReport');
const { createReportController } = require('../reportControllerFactory');

// UC-ADMIN-FIN-001: Monthly Budget Report, Finance chain (Finance Officer -> Auditor -> Bureau).
module.exports = createReportController(MonthlyBudgetReport, 'FINANCE');
