const TraineePlacement = require('../../models/department/TraineePlacement');
const { handleGuardError } = require('../crudControllerFactory');
const { placeTrainee, withdrawTraineePlacement } = require('../../services/departmentService');

/**
 * Placements are only created/withdrawn through the guarded departmentService
 * workflow so Section.enrolledCount and the capacity check can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const placements = await TraineePlacement.find().populate('learner').populate('section');
      res.json(placements);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const placement = await TraineePlacement.findById(req.params.id).populate('learner').populate('section');
      if (!placement) {
        return res.status(404).json({ message: 'Trainee placement not found.' });
      }
      res.json(placement);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-DEPT-001: Place Trainee into Section.
  async create(req, res, next) {
    try {
      const { learnerId, sectionId } = req.body;
      const placement = await placeTrainee(learnerId, sectionId);
      res.status(201).json(placement);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async withdraw(req, res, next) {
    try {
      const placement = await withdrawTraineePlacement(req.params.id);
      res.json(placement);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
