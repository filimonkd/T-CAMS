const Vendor = require('../../models/supporting/Vendor');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(Vendor);
