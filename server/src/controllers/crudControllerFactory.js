const { GuardError } = require('../services/guardService');

/**
 * Builds a basic set of CRUD handlers for a Mongoose model.
 * Model-specific controllers can spread these and add custom actions
 * on top (see controllers/supporting/stockItemController.js for example).
 */
function createCrudController(Model) {
  return {
    async create(req, res, next) {
      try {
        const doc = await Model.create(req.body);
        res.status(201).json(doc);
      } catch (err) {
        next(err);
      }
    },

    async getAll(req, res, next) {
      try {
        const docs = await Model.find();
        res.json(docs);
      } catch (err) {
        next(err);
      }
    },

    async getById(req, res, next) {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) {
          return res.status(404).json({ message: `${Model.modelName} not found.` });
        }
        res.json(doc);
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!doc) {
          return res.status(404).json({ message: `${Model.modelName} not found.` });
        }
        res.json(doc);
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
          return res.status(404).json({ message: `${Model.modelName} not found.` });
        }
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  };
}

function handleGuardError(err, res, next) {
  if (err instanceof GuardError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code });
  }
  return next(err);
}

module.exports = { createCrudController, handleGuardError };
