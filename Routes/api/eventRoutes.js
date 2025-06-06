const express = require('express');
const route = express.Router();
const fileUpload = require('express-fileupload');
const Events = require('../../controllers/event_controller');

// Ambil semua event
route.post('/getEvents', Events.getEvents);
route.post('/getEventByID', Events.getEventByID);
// Tambah event baru
route.post('/upsertEvent',Events.upsertEvent);

// Hapus event berdasarkan ID
route.post('/deleteEvent/:id', Events.deleteEvent);

route.post('/toggleActive/:id', Events.toggleActive);

module.exports = route;