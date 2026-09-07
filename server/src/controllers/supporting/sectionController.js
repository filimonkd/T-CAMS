const Section = require('../../models/supporting/Section');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(Section);
