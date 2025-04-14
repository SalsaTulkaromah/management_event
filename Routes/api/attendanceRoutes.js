const express = require('express');
const route = express.Router();
const Attendance = require('../../controllers/attendance_controller');

route.get('/getAttendanceList', Attendance.getAttendanceList);

module.exports = route;
