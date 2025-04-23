const express = require('express');
const route = express.Router();
const scanController = require('../../controllers/scan_participant_controller');

route.get('/scan-participant', scanController.renderScanPage);
route.post('/findParticipantByQRCode', scanController.findParticipantByQRCode);
route.get('/getAttendanceList', scanController.getAttendanceList);

module.exports = route;