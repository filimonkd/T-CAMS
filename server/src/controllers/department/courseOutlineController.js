const CourseOutline = require('../../models/department/CourseOutline');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensureExists, transitionStatus } = require('../../services/guardService');

const controller = createCrudController(CourseOutline);

// UC-ADMIN-DEPT-004: Approve Course Outline (DRAFT -> APPROVED).
controller.approve = async function approve(req, res, next) {
  try {
    const outline = await CourseOutline.findById(req.params.id);
    ensureExists(outline, 'Course outline');
    transitionStatus(outline, 'status', ['DRAFT'], 'APPROVED');
    await outline.save();
    res.json(outline);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

// Archive a superseded outline (APPROVED -> ARCHIVED).
controller.archive = async function archive(req, res, next) {
  try {
    const outline = await CourseOutline.findById(req.params.id);
    ensureExists(outline, 'Course outline');
    transitionStatus(outline, 'status', ['APPROVED'], 'ARCHIVED');
    await outline.save();
    res.json(outline);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
