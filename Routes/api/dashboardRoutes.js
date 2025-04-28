const express = require('express');
const route = express.Router();
const dashboardController = require('../../controllers/dashboard_controller');

route.post('/getEventStats', dashboardController.getEventStats);
route.post('/getSurveyDistribution', dashboardController.getSurveyDistribution);
route.get('/getCSATForAllEvents', dashboardController.getCSATForAllEvents);
route.post('/getParticipantsStatus', dashboardController.getParticipantsStatus);
route.post('/getSurveyResponses', dashboardController.getSurveyResponses);
module.exports = route;