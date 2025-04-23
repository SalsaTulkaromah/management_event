"use strict";
const express = require('express');
const route = express.Router();
const Survey = require('../../controllers/survey_controller');
const db = require('../../libs/db');

// Handle submit form survei
route.post('/submit', Survey.surveyEvent);

module.exports = route;