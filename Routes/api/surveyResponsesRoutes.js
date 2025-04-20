const express = require('express');
const route = express.Router();
const surveyResponses = require('../../controllers/survey_responses_controller');

// Rute untuk menampilkan data survey responses
route.get('/getSurveyResponses', surveyResponses.getSurveyResponses);

module.exports = route;
