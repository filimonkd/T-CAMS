const express = require('express');

function createReportRouter(controller) {
  const router = express.Router();

  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/:id/advance', controller.advance);
  router.post('/:id/reject', controller.reject);

  return router;
}

module.exports = { createReportRouter };
