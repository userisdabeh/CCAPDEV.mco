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

        res.render('tech/dashboard', {
            layout: 'tech',
            title: 'GoKoLab Technician Dashboard',
            stylesheets: ['dashboard.css'],
            user,
            reservations,
            activeDashboard: true
        });
    } catch (error) {
        console.error('Error loading technician dashboard:', error);
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

        res.render('tech/profile', {
            layout: 'tech',
            title: 'Technician Profile',
            stylesheets: ['profile.css'],
            user,
            activeProfile: true
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Failed to load profile');
    }
});

router.post('/tech/update-profile/:id', upload.single('profilePicture'), async (req, res) => {
    try {
        const technicianID = req.params.id;
        const { firstName, lastName, email, aboutMe, password } = req.body;

        const user = await User.findById(technicianID);
        if (!user || user.type !== 'technician') return res.status(403).send('Unauthorized');

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.aboutMe = aboutMe;

        if (password && password.trim() !== '') {
            user.password = await user.hashPassword(password);
        }

        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
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

        // Delete reservations linked to user
        await Reservation.deleteMany({ userID });

        // Delete user
        await User.findByIdAndDelete(userID);

        // Optionally destroy session or clear cookies here

        res.redirect('/'); // or to login screen
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).send('Failed to delete account');
    }
});

router.get('/tech/search', (req, res) => {
    res.render('tech/search', {
        layout: 'tech',
        title: 'Search tech Profile',
        stylesheets: ['dashboard.css'],
        activeOtherProfile: true,
        user: req.session.user
    });
});


router.post('/tech/search', async (req, res) => {
    const { email } = req.body;

    try {
        // Use a regex for partial, case-insensitive matching:
        const users = await User.find({ email: { $regex: email, $options: 'i' } }).lean();

        if (!users || users.length === 0) {
            return res.render('tech/search', {
                layout: 'tech',
                title: 'Search tech Profile',
                error: 'No users found.',
                activeOtherProfile: true,
                user: req.session.user
            });
        }

        // Render the search page with results:
        res.render('tech/search', {
            layout: 'tech',
            title: 'Search tech Profile',
            searchResults: users,
            activeOtherProfile: true,
            user: req.session.user
        });
    } catch (error) {
        console.error('Search error:', error);
        res.render('tech/search', {
            layout: 'tech',
            title: 'Search tech Profile',
            error: 'Something went wrong.',
            activeOtherProfile: true,
            user: req.session.user
        });
    }
});

router.get('/tech/otherprofile/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const profileUser = await User.findById(id).lean(); // searched user
        if (!profileUser) {
            return res.status(404).send('User not found.');
        }

        const reservations = await Reservation.find({ userID: profileUser._id })
            .populate('roomID')
            .lean();

        res.render('tech/otherprofile', {
            layout: 'tech',
            title: `Profile of ${profileUser.firstName}`,
            stylesheets: ['profile.css', 'dashboard.css'],
            scripts: ['tech_profile.js'],
            profileUser, // searched user
            user: req.session.user, // logged-in user
            reservations,
            reservationCount: reservations.length,
            activeOtherProfile: true
        });
    } catch (err) {
        console.error('Error loading other profile:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
