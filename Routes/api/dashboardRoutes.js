const express = require('express');
const route = express.Router();
const dashboardController = require('../../controllers/dashboard_controller');

route.get('/dashboard', dashboardController.getDashboard);

module.exports = route;