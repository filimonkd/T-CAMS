const TrainingEnrollment = require('../../models/hr/TrainingEnrollment');
const { handleGuardError } = require('../crudControllerFactory');
const {
  enrollInTraining,
  completeTrainingEnrollment,
  cancelTrainingEnrollment,
} = require('../../services/hrService');

/**
 * Enrollments are only created/completed/cancelled through the guarded
 * hrService workflow so the contract-prerequisite and clearance-hold checks
 * can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const enrollments = await TrainingEnrollment.find().populate('trainingSchedule');
      res.json(enrollments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const enrollment = await TrainingEnrollment.findById(req.params.id).populate('trainingSchedule');
      if (!enrollment) {
        return res.status(404).json({ message: 'Training enrollment not found.' });
      }
      res.json(enrollment);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-HR-007: Enroll in Training.
  async create(req, res, next) {
    try {
      const { employeeName, trainingScheduleId } = req.body;
      const enrollment = await enrollInTraining(employeeName, trainingScheduleId);
      res.status(201).json(enrollment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async complete(req, res, next) {
    try {
      const enrollment = await completeTrainingEnrollment(req.params.id);
      res.json(enrollment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async cancel(req, res, next) {
    try {
      const enrollment = await cancelTrainingEnrollment(req.params.id);
      res.json(enrollment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
