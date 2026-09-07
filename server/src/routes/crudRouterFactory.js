const express = require('express');

/**
 * Mounts standard CRUD routes for a controller built with createCrudController.
 * Returns the router so callers can add custom routes before/after mounting.
 */
function createCrudRouter(controller) {
  const router = express.Router();

  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

module.exports = { createCrudRouter };
