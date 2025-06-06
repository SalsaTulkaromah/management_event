const express = require('express');
const route = express.Router();
const Attendance = require('../../controllers/attendance_controller');

route.get('/getAttendanceList',Attendance.getAttendanceList);
route.get('/getByQRCode', Attendance.getParticipantByQRCode); // pakai query param\
route.post('/sendSurveyEmail', Attendance.sendSurveyEmail);

module.exports = route;