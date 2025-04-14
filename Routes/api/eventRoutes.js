const express = require('express');
const route = express.Router();
const Events = require('../../controllers/event_controller');

// Ambil semua event
route.post('/getEvents', Events.getEvents);

// Tambah event baru
route.post('/insertEvent', Events.insertEvent);

// Update event berdasarkan ID
route.put('/updateEvent/:id', Events.updateEvent);

// Hapus event berdasarkan ID
route.post('/deleteEvent/:id', Events.deleteEvent);

module.exports = route;
