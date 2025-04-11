"use strict";
var express = require('express');
var route = express.Router();
var Register = require('../../controllers/register_controller');

route.post('/registerEvent', Register.registerEvent);
route.get('/validateGuid', Register.validateEventGuid);

module.exports = route;