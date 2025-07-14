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

        const reservations = await Reservation.find().populate('userID roomID').lean();

        const rooms = await Room.find().lean();
        const totalSlots = rooms.reduce((sum, room) => sum + room.roomSlots, 0);

        const availableLabs = await Room.find({ roomStatus: 'available' }).lean();
        const underMaintenanceLabs = await Room.find({ roomStatus: 'maintenance' }).lean();

        res.render('tech/dashboard', {
            layout: 'tech',
            title: 'GoKoLab Technician Dashboard',
            stylesheets: ['tech_dashboard.css'],
            user,
            reservations,
            activeDashboard: true,
            totalSlots,
            availableLabs,
            underMaintenanceLabs
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

router.post('/tech/delete-account/:id', async (req, res) => {
    try {
        const userID = req.params.id;
        await Reservation.deleteMany({ userID });
        await User.findByIdAndDelete(userID);
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).send('Failed to delete account');
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

module.exports = router;
