const controller = require('../../controllers/department/attendanceRecordController');
const { createCrudRouter } = require('../crudRouterFactory');

module.exports = createCrudRouter(controller);
