const express = require('express');
const route = express.Router();

route.get('/loginManagementEvent', (req, res, next) => {
    res.render('auth/login', { title: 'Login', layout: false })
})

route.get('/register-event', (req, res, next) => {
    res.render('auth/register-event', { title: 'Register Event', layout: false })
})

route.get('/', (req, res, next) => {
    res.render('dashboard', {
        title: 'My Application',
        page_title: 'Dashboard',
        folder: 'Dashboard'
    });
})
route.get('/dashboard', (req, res, next) => {

    res.render('dashboard', {
        title: 'My Application',
        page_title: 'Dashboard',
        folder: 'Dashboard'
    });
})

route.get('/participants', (req, res) => {
    res.render('participants', {
        title: 'Participants',
        page_title: 'Participants',
        folder: 'Participants'
    });
});

route.get('/attendance', (req, res) => {
    res.render('attendance', {
        title: 'Attendance',
        page_title: 'Attendance',
        folder: 'Attendance'
    });
});

route.get('/scan-participant', (req, res) => {
    res.render('scan-participant', {
        title: 'Scan Participant',
        page_title: 'Scan Participant',
        folder: 'Participant'
    });
});

route.get('/souvenir-exchange', (req, res) => {
    res.render('souvenir-exchange', {
        title: 'Souvenir Exchange',
        page_title: 'Souvenir Exchange',
        folder: 'Event'
    });
});

route.get('/spin', (req, res) => {
    res.render('spin', {
        title: 'Spin',
        page_title: 'Spin Wheel',
        folder: 'Event'
    });
});

route.get('/manage-event', (req, res) => {
    res.render('manage-event', {
        title: 'Manage Event',
        page_title: 'Manage Event',
        folder: 'Event'
    });
});

route.get('/survey', (req, res, next) => {
    res.render('auth/survey', { title: 'Survey', layout: false })
})

route.get('/manage-feedbackform', (req, res) => {
    res.render('manage-feedbackform', {
        title: 'Manage Feedback Form',
        page_title: 'Manage Feedback Form',
        folder: 'Event'
    });
});

route.get('/manage-feedbackresponses', (req, res) => {
    res.render('manage-feedbackresponses', {
        title: 'Manage Feedback Responses',
        page_title: 'Manage Feedback Responses',
        folder: 'Event'
    });
});

module.exports = route;