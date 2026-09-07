const Trainer = require('../../models/department/Trainer');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(Trainer);
