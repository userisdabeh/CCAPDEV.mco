const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const User = require('../../model/user.model.js');
const Room = require('../../model/room.model.js');
const Reservation = require('../../model/reservation.model.js');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

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

router.post('/student/update-profile/:id', upload.single('profilePicture'), async (req, res) => {
    try {
        const userID = req.params.id;
        const {
            firstName,
            lastName,
            email,
            aboutMe,
            password
        } = req.body;

        const user = await User.findById(userID);
        if (!user) return res.status(404).send('User not found');

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.aboutMe = aboutMe;

        // Hash and update password if provided
        if (password && password.trim() !== '') {
            user.password = await user.hashPassword(password);
        }

        // Update profile picture path if new image uploaded
        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        await user.save();
        res.redirect(`/student/profile/${userID}`);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).send('Failed to update profile');
    }
});

router.post('/student/delete-account/:id', async (req, res) => {
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

router.get('/student/search', (req, res) => {
    res.render('student/search', {
        layout: 'student',
        title: 'Search Students Profile',
        stylesheets: ['search.css', 'dashboard.css'],
        activeSearch: true,
        user: req.session.user
    });
});


router.post('/student/search', async (req, res) => {
    const { email } = req.body;

    try {
        const users = await User.find({ email: { $regex: email, $options: 'i' } }).lean();

        const renderData = {
            layout: 'student',
            title: 'Search Student Profile',
            stylesheets: ['search.css', 'dashboard.css'],
            activeSearch: true,
            user: req.session.user
        };

        if (!users || users.length === 0) {
            renderData.error = 'No users found.';
        } else {
            renderData.searchResults = users;
        }

        res.render('student/search', renderData);
    } catch (error) {
        console.error('Search error:', error);
        res.render('student/search', {
            layout: 'student',
            title: 'Search Student Profile',
            error: 'Something went wrong.',
            stylesheets: ['search.css', 'dashboard.css'],
            activeSearch: true,
            user: req.session.user
        });
    }
});


router.get('/student/otherprofile/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const profileUser = await User.findById(id).lean(); // searched user
        if (!profileUser) {
            return res.status(404).send('User not found.');
        }

        const reservations = await Reservation.find({ userID: profileUser._id })
            .populate('roomID')
            .lean();

        res.render('student/otherprofile', {
            layout: 'student',
            title: `Profile of ${profileUser.firstName}`,
            stylesheets: ['profile.css', 'search.css', 'dashboard.css'],
            scripts: ['student_profile.js'],
            profileUser, // searched user
            user: req.session.user, // logged-in user
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