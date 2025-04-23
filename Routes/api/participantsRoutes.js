const express = require('express');
const route = express.Router();
const Participants = require('../../controllers/participants_controller');

route.get('/getParticipants', Participants.getParticipants); 
route.post('/insertParticipant', Participants.insertParticipant);
route.put('/updateParticipant/:id',Participants.updateParticipant);
route.post('/deleteParticipant/:id', Participants.deleteParticipant);
route.post('/approve/:id', Participants.approveParticipant); 
route.post('/reject/:id', Participants.rejectParticipant); 

module.exports = route;