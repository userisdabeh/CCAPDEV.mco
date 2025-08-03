const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const User = require('../../model/user.model.js');
const Reservation = require('../../model/reservation.model.js');
const Room = require('../../model/room.model.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) =>
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/tech/dashboard/:id', async (req, res) => {
    try {
        const technicianID = req.params.id;
        const user = await User.findById(technicianID).lean();
        if (!user || user.type !== 'technician') {
            return res.status(403).send('Unauthorized');
        }

        const reservations = await Reservation.find()
            .populate('userID roomID')
            .sort({ createdAt: -1 })
            .lean();

        const processedReservations = reservations.map(reservation => {
            const reservationDateTime = new Date(reservation.reservationDate);
            
            let reservationTime;
            if (reservation.timeSlot) {
                const [startTime] = reservation.timeSlot.split(' - ');
                const [hours, minutes] = startTime.split(':');
                reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                reservationTime = reservationDateTime;
            } else if (reservation.startTime) {
                reservationTime = new Date(reservation.startTime);
            } else {
                reservationTime = new Date(reservation.reservationDate);
            }
            
            const now = new Date();
            const timeDifference = Math.abs(now - reservationTime);
            const minutesDifference = Math.floor(timeDifference / 60000);
            
            const isWithinRemovalWindow = minutesDifference <= 10;
            
            const isExpired = now > reservationTime;
            
            return {
                ...reservation,
                isWithinRemovalWindow,
                isExpired
            };
        });

        const rooms = await Room.find().lean();
        const totalSlots = rooms.reduce((sum, room) => sum + room.roomSlots, 0);

        const availableLabs = await Room.find({ roomStatus: 'available' }).lean();
        const underMaintenanceLabs = await Room.find({ roomStatus: 'maintenance' }).lean();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalThisMonth = await Reservation.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        const activeReservations = await Reservation.countDocuments({
            status: { $in: ['Pending', 'Confirmed'] }
        });

        res.render('tech/dashboard', {
            layout: 'tech',
            title: 'GoKoLab Technician Dashboard',
            stylesheets: ['tech_dashboard.css'],
            user,
            reservations: processedReservations,
            activeDashboard: true,
            totalSlots,
            availableLabs,
            underMaintenanceLabs,
            totalThisMonth,
            activeReservations
        });
    } catch (error) {
        console.error('Error loading technician dashboard:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/tech/reserve/:id', async (req, res) => {
    try {
        const technicianID = req.params.id;
        const user = await User.findById(technicianID).lean();
        if (!user || user.type !== 'technician') {
            return res.status(403).send('Unauthorized');
        }

        res.render('tech/reserve', {
            layout: 'tech',
            title: 'Reservations',
            stylesheets: ['tech_reserve.css'],
            scripts: ['reserve.js'],
            user,
            activeReserve: true
        });
    } catch (error) {
        console.error('Error loading technician reservations:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/tech/profile/:id', async (req, res) => {
    try {
        const technicianID = req.params.id;
        const user = await User.findById(technicianID).lean();
        if (!user || user.type !== 'technician') {
            return res.status(403).send('Unauthorized');
        }

        const yearsOfService = new Date().getFullYear() - new Date(user.createdAt).getFullYear();

        res.render('tech/profile', {
            layout: 'tech',
            title: 'Technician Profile',
            stylesheets: ['tech_profile.css'],
            scripts: ['tech_profile.js'],
            user,
            activeProfile: true,
            taskCount: user.tasks?.length || 0,
            yearsOfService
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Failed to load profile');
    }
});

router.post('/tech/update-profile/:id', upload.single('profilePicture'), async (req, res) => {
    try {
        const technicianID = req.params.id;
        const { firstName, lastName, phoneNumber, specialty, aboutMe } = req.body;

        const user = await User.findById(technicianID);
        if (!user || user.type !== 'technician') return res.status(403).send('Unauthorized');

        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        user.specialty = specialty;
        user.aboutMe = aboutMe;

        if (req.file) {
            user.profilePicture = '/uploads/' + req.file.filename;
        }

        await user.save();
        res.redirect(`/tech/profile/${technicianID}`);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).send('Failed to update profile');
    }
});

router.post('/tech/delete-reservation/:id', async (req, res) => {
    try {
        const technicianID = req.body.technicianId;
        const reservationId = req.params.id;
        
        const user = await User.findById(technicianID);
        if (!user || user.type !== 'technician') {
            return res.status(403).send('Unauthorized');
        }

        const reservation = await Reservation.findById(reservationId).populate('roomID');
        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        const reservationDateTime = new Date(reservation.reservationDate);
        
        let reservationTime;
        if (reservation.timeSlot) {
            const [startTime] = reservation.timeSlot.split(' - ');
            const [hours, minutes] = startTime.split(':');
            reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            reservationTime = reservationDateTime;
        } else if (reservation.startTime) {
            reservationTime = new Date(reservation.startTime);
        } else {
            reservationTime = new Date(reservation.reservationDate);
        }
        
        const now = new Date();
        const timeDifference = Math.abs(now - reservationTime);
        const minutesDifference = Math.floor(timeDifference / 60000);
        const reservationHasPassed = now > reservationTime;
        const minutesPastReservation = Math.floor((now - reservationTime) / 60000);
        
        if (!reservationHasPassed || minutesPastReservation < 10) {
            return res.status(400).send('Reservation can only be deleted if the reservation time has passed by 10 minutes or more (student no-show)');
        }

        await Reservation.findByIdAndDelete(reservationId);
        
        res.redirect(`/tech/dashboard/${technicianID}`);
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/tech/search', (req, res) => {
    res.render('tech/search', {
        layout: 'tech',
        title: 'Search User Profile',
        stylesheets: ['search.css', 'dashboard.css'],
        activeSearch: true,
        user: req.session.user
    });
});

router.post('/tech/search', async (req, res) => {
    const { email } = req.body;

    try {
        const users = await User.find({ email: { $regex: email, $options: 'i' } }).lean();

        const renderData = {
            layout: 'tech',
            title: 'Search User Profile',
            stylesheets: ['search.css', 'dashboard.css'],
            activeSearch: true,
            user: req.session.user
        };

        if (!users || users.length === 0) {
            renderData.error = 'No users found.';
        } else {
            renderData.searchResults = users;
        }

        res.render('tech/search', renderData);
    } catch (error) {
        console.error('Search error:', error);
        res.render('tech/search', {
            layout: 'tech',
            title: 'Search User Profile',
            error: 'Something went wrong.',
            stylesheets: ['search.css', 'dashboard.css'],
            activeSearch: true,
            user: req.session.user
        });
    }
});

router.get('/tech/otherprofile/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const profileUser = await User.findById(id).lean();
        if (!profileUser) {
            return res.status(404).send('User not found.');
        }

        const reservations = await Reservation.find({ userID: profileUser._id })
            .populate('roomID')
            .lean();

        res.render('tech/otherprofile', {
            layout: 'tech',
            title: `Profile of ${profileUser.firstName}`,
            stylesheets: ['profile.css', 'search.css', 'dashboard.css'],
            scripts: ['tech_profile.js'],
            profileUser,
            user: req.session.user,
            reservations,
            reservationCount: reservations.length,
            activeSearch: true
        });
    } catch (err) {
        console.error('Error loading other profile:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/tech/edit-reservation/:id/:technicianId', async (req, res) => {
    try {
        const technicianID = req.params.technicianId;
        const reservationId = req.params.id;
        
        const user = await User.findById(technicianID);
        if (!user || user.type !== 'technician') {
            return res.status(403).send('Unauthorized');
        }

        const reservation = await Reservation.findById(reservationId).populate('userID roomID');
        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        const reservationDateTime = new Date(reservation.reservationDate);
        
        let reservationTime;
        if (reservation.timeSlot) {
            const [startTime] = reservation.timeSlot.split(' - ');
            const [hours, minutes] = startTime.split(':');
            reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            reservationTime = reservationDateTime;
        } else if (reservation.startTime) {
            reservationTime = new Date(reservation.startTime);
        } else {
            reservationTime = new Date(reservation.reservationDate);
        }
        
        const now = new Date();
        const reservationHasPassed = now > reservationTime;
        const minutesPastReservation = Math.floor((now - reservationTime) / 60000);
        
        if (!reservationHasPassed || minutesPastReservation < 10) {
            return res.status(400).send('Reservation can only be edited if the reservation time has passed by 10 minutes or more (student no-show)');
        }

        const rooms = await Room.find().lean();
        
        res.render('tech/reserve', {
            layout: 'tech',
            title: 'Edit Reservation',
            stylesheets: ['tech_reserve.css'],
            scripts: ['reserve.js'],
            user,
            reservation,
            rooms,
            isEditing: true,
            activeReserve: true
        });
    } catch (error) {
        console.error('Error loading reservation for edit:', error);
        res.status(500).send('Server Error');
    }
});

router.post('/tech/update-reservation/:id/:technicianId', async (req, res) => {
    try {
        const technicianID = req.params.technicianId;
        const reservationId = req.params.id;
        const { room, date, time, name, anonymous } = req.body;
        
        const user = await User.findById(technicianID);
        if (!user || user.type !== 'technician') {
            return res.status(403).send('Unauthorized');
        }

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        reservation.roomID = room;
        reservation.reservationDate = new Date(date);
        reservation.timeSlot = time;
        reservation.name = name || 'Anonymous';
        reservation.anonymous = !!anonymous;

        await reservation.save();
        
        res.redirect(`/tech/dashboard/${technicianID}`);
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
