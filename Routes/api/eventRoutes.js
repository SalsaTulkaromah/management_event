const express = require('express');
const route = express.Router();
const fileUpload = require('express-fileupload');
const Events = require('../../controllers/event_controller');

// Ambil semua event
route.post('/getEvents', Events.getEvents);

// Tambah event baru
route.post('/upsertEvent', Events.upsertEvent);

// Hapus event berdasarkan ID
route.post('/deleteEvent/:id', Events.deleteEvent);

module.exports = route;
