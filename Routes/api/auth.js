"use strict";
var express = require('express');
var route = express.Router();
var Login = require('../../controllers/login_controller');

route.post('/login', Login.loginManagementEvent);
module.exports = route;