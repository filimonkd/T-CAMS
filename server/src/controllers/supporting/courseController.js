const Course = require('../../models/supporting/Course');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensureExists, transitionStatus } = require('../../services/guardService');

const controller = createCrudController(Course);

// ACAD-004: Retire/Deactivate Course (ACTIVE -> RETIRED).
controller.retire = async function retire(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    ensureExists(course, 'Course');
    await transitionStatus(course, 'status', ['ACTIVE'], 'RETIRED', 'ACAD-004');

    await course.save();
    res.json(course);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
