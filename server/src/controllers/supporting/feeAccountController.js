const FeeAccount = require('../../models/supporting/FeeAccount');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(FeeAccount);
