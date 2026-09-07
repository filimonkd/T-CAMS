const BiometricEnrollment = require('../../models/hr/BiometricEnrollment');
const { handleGuardError } = require('../crudControllerFactory');
const { enrollBiometric, revokeBiometricEnrollment } = require('../../services/hrService');

/**
 * Enrollments are only created/revoked through the guarded hrService
 * workflow so the biometric-uniqueness check can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const enrollments = await BiometricEnrollment.find();
      res.json(enrollments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const enrollment = await BiometricEnrollment.findById(req.params.id);
      if (!enrollment) {
        return res.status(404).json({ message: 'Biometric enrollment not found.' });
      }
      res.json(enrollment);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-HR-008: Enroll Biometric.
  async create(req, res, next) {
    try {
      const { employeeName, biometricHash } = req.body;
      const enrollment = await enrollBiometric(employeeName, biometricHash);
      res.status(201).json(enrollment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async revoke(req, res, next) {
    try {
      const enrollment = await revokeBiometricEnrollment(req.params.id);
      res.json(enrollment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
