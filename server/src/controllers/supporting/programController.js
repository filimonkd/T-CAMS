const Program = require('../../models/supporting/Program');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(Program);
