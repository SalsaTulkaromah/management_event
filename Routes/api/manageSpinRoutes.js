const express = require('express');
const route = express.Router();
const ManageSpin = require('../../controllers/manage_spin_controller');

route.get('/getSpinList', ManageSpin.getSpinList);

module.exports = route;