const express = require('express');
const route = express.Router();
const Participants = require('../../controllers/participants_controller');

route.get('/getParticipants', Participants.getParticipants); 
route.post('/approve/:id', Participants.approveParticipant); 
route.post('/reject/:id', Participants.rejectParticipant); 

module.exports = route;