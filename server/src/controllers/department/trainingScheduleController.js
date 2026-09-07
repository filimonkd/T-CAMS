const TrainingSchedule = require('../../models/department/TrainingSchedule');
const { handleGuardError } = require('../crudControllerFactory');
const { scheduleTraining, cancelTrainingSchedule } = require('../../services/departmentService');

/**
 * Schedules are only created/cancelled through the guarded departmentService
 * workflow so Trainer.scheduledHours and the contract-hour check can't be
 * bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const schedules = await TrainingSchedule.find().populate('trainer').populate('section');
      res.json(schedules);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const schedule = await TrainingSchedule.findById(req.params.id).populate('trainer').populate('section');
      if (!schedule) {
        return res.status(404).json({ message: 'Training schedule not found.' });
      }
      res.json(schedule);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-DEPT-002: Create Training Schedule.
  async create(req, res, next) {
    try {
      const { trainerId, sectionId, scheduledDate, hours } = req.body;
      const schedule = await scheduleTraining(trainerId, sectionId, new Date(scheduledDate), hours);
      res.status(201).json(schedule);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async cancel(req, res, next) {
    try {
      const schedule = await cancelTrainingSchedule(req.params.id);
      res.json(schedule);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
