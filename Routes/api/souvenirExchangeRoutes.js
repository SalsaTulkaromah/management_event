const express = require('express');
const route = express.Router();
const controller = require('../../controllers/souvenir_exchange_controller');

route.get('/getAttendanceList', controller.getAttendanceList);
route.post('/findParticipantByQRCode',controller.findParticipantByQRCode);

module.exports = route;