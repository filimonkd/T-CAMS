const controller = require('../../controllers/finance/annualBudgetPlanController');
const { createReportRouter } = require('../reportRouterFactory');

module.exports = createReportRouter(controller);
