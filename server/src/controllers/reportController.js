const {
  generateQualificationCertificate,
  generateOverdueReportExport,
  generateBudgetReportExport,
} = require('../services/reportService');
const { handleGuardError } = require('./crudControllerFactory');

const controller = {
  // GET /api/reports/qualifications/:enrollmentId
  async qualification(req, res, next) {
    try {
      const payload = await generateQualificationCertificate(req.params.enrollmentId);
      res.json(payload);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  // GET /api/reports/library-overdue
  async libraryOverdue(req, res, next) {
    try {
      const payload = await generateOverdueReportExport();
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/reports/budget-reports/:reportType(monthly|annual)/:reportId
  async budgetReport(req, res, next) {
    try {
      const { reportType, reportId } = req.params;
      const normalizedType = reportType === 'annual' ? 'ANNUAL' : 'MONTHLY';
      const payload = await generateBudgetReportExport(normalizedType, reportId);
      res.json(payload);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
