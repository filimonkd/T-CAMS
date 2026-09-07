const { getOverdueReport } = require('../../services/libraryService');

// LIB-007: Overdue report - no dedicated collection, just a query over Loan.
const controller = {
  async overdue(req, res, next) {
    try {
      const report = await getOverdueReport();
      res.json({ count: report.length, loans: report });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = controller;
