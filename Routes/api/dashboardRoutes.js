const express = require('express');
const route = express.Router();
const dashboardController = require('../../controllers/dashboard_controller');

route.post('/getEventStats', dashboardController.getEventStats);

module.exports = route;