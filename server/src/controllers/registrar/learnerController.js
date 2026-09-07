const Learner = require('../../models/registrar/Learner');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(Learner);
