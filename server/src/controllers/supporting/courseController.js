const Course = require('../../models/supporting/Course');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensureExists, ensureStatusTransitionAllowed } = require('../../services/guardService');

const controller = createCrudController(Course);

// ACAD-004: Retire/Deactivate Course (ACTIVE -> RETIRED).
controller.retire = async function retire(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    ensureExists(course, 'Course');
    ensureStatusTransitionAllowed(course.status, ['ACTIVE'], 'RETIRED');

    course.status = 'RETIRED';
    await course.save();
    res.json(course);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
