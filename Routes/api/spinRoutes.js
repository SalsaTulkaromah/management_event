const express = require('express');
const route = express.Router();
const spinController = require('../../controllers/spin_controller');

route.get('/getSpinPage', spinController.getSpinPage);

module.exports = route;
