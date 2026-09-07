const Section = require('../../models/supporting/Section');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensure, ensureExists, ensureStatusTransitionAllowed } = require('../../services/guardService');

const controller = createCrudController(Section);

// ACAD-006: Assign Section Capacity Limit (cannot drop below current enrollment).
controller.setCapacity = async function setCapacity(req, res, next) {
  try {
    const { capacity } = req.body;
    const section = await Section.findById(req.params.id);
    ensureExists(section, 'Section');
    ensure(
      capacity >= section.enrolledCount,
      `Capacity cannot be less than current enrollment (${section.enrolledCount}).`,
      'CAPACITY_BELOW_ENROLLMENT',
    );

    section.capacity = capacity;
    await section.save();
    res.json(section);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

// ACAD-008: Close Section at Term End (OPEN -> CLOSED).
controller.close = async function close(req, res, next) {
  try {
    const section = await Section.findById(req.params.id);
    ensureExists(section, 'Section');
    ensureStatusTransitionAllowed(section.status, ['OPEN'], 'CLOSED');

    section.status = 'CLOSED';
    await section.save();
    res.json(section);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
