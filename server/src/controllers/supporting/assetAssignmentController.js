const AssetAssignment = require('../../models/supporting/AssetAssignment');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(AssetAssignment);
