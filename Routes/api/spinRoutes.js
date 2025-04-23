const express = require('express');
const route = express.Router();
const spinController = require('../../controllers/spin_controller');

route.post('/getSpinPage',spinController.getSpinPage);
route.post('/setWinner',spinController.setWinner);
route.get('/getWinners', spinController.getWinners);
module.exports = route;