const Course = require('../../models/supporting/Course');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(Course);
