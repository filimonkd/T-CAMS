const controller = require('../../controllers/budget/monthlyBudgetReportController');
const { createReportRouter } = require('../reportRouterFactory');

module.exports = createReportRouter(controller);
