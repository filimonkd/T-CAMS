const MonthlyBudgetReport = require('../../models/budget/MonthlyBudgetReport');
const { createReportController } = require('../reportControllerFactory');

// UC-ADMIN-RPB-001: Monthly Budget Report, RPB chain (Budget Officer -> Bureau).
module.exports = createReportController(MonthlyBudgetReport, 'RPB');
