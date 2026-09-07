const Program = require('../../models/supporting/Program');
const { createCrudController, handleGuardError } = require('../crudControllerFactory');
const { ensureExists, transitionStatus } = require('../../services/guardService');

const controller = createCrudController(Program);

// ACAD-002: Approve Program Curriculum (DRAFT -> ACTIVE).
controller.approve = async function approve(req, res, next) {
  try {
    const program = await Program.findById(req.params.id);
    ensureExists(program, 'Program');
    await transitionStatus(program, 'status', ['DRAFT'], 'ACTIVE', 'ACAD-002');

    await program.save();
    res.json(program);
  } catch (err) {
    handleGuardError(err, res, next);
  }
};

module.exports = controller;
