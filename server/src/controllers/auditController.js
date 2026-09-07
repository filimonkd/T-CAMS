const { getEntityHistory, getComplianceLog } = require('../services/auditService');

const controller = {
  // GET /api/audit/:entityType/:entityId - full chronological history for one document.
  async getEntityHistory(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const history = await getEntityHistory(entityType, entityId);
      res.json({ entityType, entityId, count: history.length, history });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/audit/compliance?isoClause=&regulatoryClause=&startDate=&endDate=
  async getComplianceLog(req, res, next) {
    try {
      const { isoClause, regulatoryClause, startDate, endDate } = req.query;
      const entries = await getComplianceLog({ isoClause, regulatoryClause, startDate, endDate });
      res.json({ count: entries.length, entries });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = controller;
