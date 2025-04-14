"use strict";
const express = require('express');
const route = express.Router();
const Survey = require('../../controllers/survey_controller');
const db = require('../../libs/db');

// Tampilkan form survei berdasarkan ID peserta
route.get('/survey/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const result = await db.query('SELECT * FROM tbl_participants WHERE id = $1', [participantId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Peserta tidak ditemukan');
        }

        res.render('survey', { participant: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Kesalahan server');
    }
});

// Handle submit form survei
route.post('/survey', Survey.surveyEvent);

module.exports = route;
