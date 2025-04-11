const express = require('express');
const route = express.Router();
const Participants = require('../../controllers/participants_controller');

// Endpoint untuk mengambil seluruh peserta
route.get('/getParticipants', Participants.getParticipants); // endpoint: /participants/list

// Endpoint untuk menyetujui peserta
route.post('/approve/:id', Participants.approveParticipant); // /participants/approve/:id

// Endpoint untuk menolak peserta
route.post('/reject/:id', Participants.rejectParticipant); // /participants/reject/:id

module.exports = route;