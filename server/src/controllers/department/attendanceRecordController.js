const AttendanceRecord = require('../../models/department/AttendanceRecord');
const { createCrudController } = require('../crudControllerFactory');

module.exports = createCrudController(AttendanceRecord);
