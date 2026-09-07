const express = require('express');
const controller = require('../../controllers/library/reportController');

const router = express.Router();

router.get('/overdue', controller.overdue);

module.exports = router;
