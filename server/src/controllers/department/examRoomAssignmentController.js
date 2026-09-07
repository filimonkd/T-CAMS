const ExamRoomAssignment = require('../../models/department/ExamRoomAssignment');
const { handleGuardError } = require('../crudControllerFactory');
const { assignExamRoom, cancelExamRoomAssignment } = require('../../services/departmentService');

/**
 * Assignments are only created/cancelled through the guarded
 * departmentService workflow so the room-capacity check can't be bypassed.
 */
const controller = {
  async getAll(req, res, next) {
    try {
      const assignments = await ExamRoomAssignment.find().populate('section').populate('room');
      res.json(assignments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const assignment = await ExamRoomAssignment.findById(req.params.id).populate('section').populate('room');
      if (!assignment) {
        return res.status(404).json({ message: 'Exam room assignment not found.' });
      }
      res.json(assignment);
    } catch (err) {
      next(err);
    }
  },

  // UC-ADMIN-DEPT-007: Assign Exam Room.
  async create(req, res, next) {
    try {
      const { sectionId, roomId, examDate, cohortSize } = req.body;
      const assignment = await assignExamRoom(sectionId, roomId, new Date(examDate), cohortSize);
      res.status(201).json(assignment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },

  async cancel(req, res, next) {
    try {
      const assignment = await cancelExamRoomAssignment(req.params.id);
      res.json(assignment);
    } catch (err) {
      handleGuardError(err, res, next);
    }
  },
};

module.exports = controller;
