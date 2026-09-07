const controller = require('../../controllers/budget/annualBudgetPlanController');
const { createReportRouter } = require('../reportRouterFactory');

module.exports = createReportRouter(controller);
