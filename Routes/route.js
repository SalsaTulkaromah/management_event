const express = require('express');
const route = express.Router();

route.get('/loginManagementEvent', (req, res, next) => {
    res.render('auth/login', { title: 'Login', layout: false })
})

route.get('/logout', (req, res, next) => {
    res.clearCookie('event_objectCookie');

    res.render('auth/login', { title: 'Login', layout: false, flag : 'Login' });
})

route.get('/register-event', (req, res, next) => {
    res.render('auth/register-event', { title: 'Register Event', layout: false })
})

route.get('/', (req, res, next) => {
    if (req.cookies.event_objectCookie) {
        res.render('dashboard', {
            title: 'My Application',
            page_title: 'Dashboard',
            folder: 'Dashboard',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
    
})
route.get('/dashboard', (req, res, next) => {
    if (req.cookies.event_objectCookie) {
        res.render('dashboard', {
            title: 'My Application',
            page_title: 'Dashboard',
            folder: 'Dashboard',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
})

route.get('/participants', (req, res) => {
    if (req.cookies.event_objectCookie) {
        res.render('participants', {
            title: 'Participants',
            page_title: 'Participants',
            folder: 'Participants',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
});

route.get('/attendance', (req, res) => {
    if (req.cookies.event_objectCookie) {
        res.render('attendance', {
            title: 'Attendance',
            page_title: 'Attendance',
            folder: 'Attendance',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
});

route.get('/scan-participant', (req, res) => {
    if (req.cookies.event_objectCookie) {
        res.render('scan-participant', {
            title: 'Scan Participant',
            page_title: 'Scan Participant',
            folder: 'Participant',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
});

route.get('/souvenir-exchange', (req, res) => {
    if (req.cookies.event_objectCookie) {
        res.render('souvenir-exchange', {
            title: 'Souvenir Exchange',
            page_title: 'Souvenir Exchange',
            folder: 'Event',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
});


route.get('/manage-spin', (req, res) => {
    if (req.cookies.event_objectCookie) {
        res.render('manage-spin', {
            title: 'Manage Spin The Wheel',
            page_title: 'Manage Spin The Wheel',
            folder: 'Event',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
});

route.get('/spin', (req, res, next) => {
    res.render('spin', { title: 'Spin The Wheel', layout: false })
})

route.get('/manage-event', (req, res) => {
    if (req.cookies.event_objectCookie) {
        res.render('manage-event', {
            title: 'Manage Event',
            page_title: 'Manage Event',
            folder: 'Event',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
});

route.get('/survey', (req, res, next) => {
    res.render('auth/survey', { title: 'Survey', layout: false })
})

route.get('/manage-surveyresponses', (req, res) => {
    if (req.cookies.event_objectCookie) {
        res.render('manage-surveyresponses', {
            title: 'Manage Survey Responses',
            page_title: 'Manage Survey Responses',
            folder: 'Event',
            event_objectCookie: req.cookies.event_objectCookie
        });
    } else {
        res.render('auth/login', { title: 'Login', layout: false, flag : 'Expired' });
    }
});

module.exports = route;