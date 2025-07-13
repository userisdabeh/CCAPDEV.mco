const express = require('express');
const router = express.Router();

const User = require('../../model/user.model.js');
const Room = require('../../model/room.model.js');
const Reservation = require('../../model/reservation.model.js');

function getNext7DatesExcludingSundays() {
    const dates = [];
    let currentDate = new Date();

    while (dates.length < 7) {
        if (currentDate.getDay() !== 0) {
            const formatted = currentDate.toISOString().split('T')[0];
            dates.push(formatted);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

router.get('/student/dashboard/:id', async (req, res) => {
    const studentID = req.params.id;

    try {
        const user = await User.findOne({ _id: studentID }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.render('student/dashboard', {
            layout: 'student',
            title: 'GoKoLab Student Dashboard',
            stylesheets: ['dashboard.css'],
            user,
            activeDashboard: true
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.get('/student/reserve/:id', async (req, res) => {
    const studentID = req.params.id;

    try {
        const user = await User.findOne({ _id: studentID }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const rooms = await Room.find({}).lean();
        const dates = getNext7DatesExcludingSundays();

        res.render('student/reserve', {
            layout: 'student',
            title: 'GoKoLab Student Dashboard - Reserve',
            stylesheets: ['reserve.css'],
            scripts: ['reserve.js'],
            user,
            rooms,
            dates,
            activeReserve: true
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.get('/student/profile/:id', async (req, res) => {
    const studentID = req.params.id;

    try {
        const user = await User.findOne({ _id: studentID }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const reservations = await Reservation.find({ userID: studentID }).populate('roomID').lean();

        res.render('student/profile', {
            layout: 'student',
            title: 'GoKoLab Student Dashboard - Profile',
            stylesheets: ['profile.css', 'dashboard.css'],
            scripts: ['student_profile.js'],
            user,
            reservations,
            reservationCount: reservations.length,
            activeProfile: true
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;