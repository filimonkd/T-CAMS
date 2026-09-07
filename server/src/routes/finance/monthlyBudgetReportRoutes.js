const controller = require('../../controllers/finance/monthlyBudgetReportController');
const { createReportRouter } = require('../reportRouterFactory');

module.exports = createReportRouter(controller);
