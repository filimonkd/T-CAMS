const Enrollment = require('../../models/registrar/Enrollment');
const { handleGuardError } = require('../crudControllerFactory');
const { enrollLearner, withdrawEnrollment } = require('../../services/registrarService');

/**
 * Enrollment records are only created/changed through the guarded
 * registrarService workflow (enroll/withdraw) rather than raw CRUD, so that
 * Section.enrolledCount and capacity checks can never be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const enrollments = await Enrollment.find().populate('learner').populate('section');
      res.json(enrollments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const enrollment = await Enrollment.findById(req.params.id).populate('learner').populate('section');
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found.' });
      }
      res.json(enrollment);
    } catch (err) {
      next(err);
    }
  },

  // ACAD-007: Enroll Learner into Section.
  async create(req, res, next) {
    try {
      const { learnerId, sectionId } = req.body;
      const enrollment = await enrollLearner(learnerId, sectionId);
      res.status(201).json(enrollment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async withdraw(req, res, next) {
    try {
      const enrollment = await withdrawEnrollment(req.params.id);
      res.json(enrollment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
