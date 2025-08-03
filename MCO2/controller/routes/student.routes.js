const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const User = require('../../model/user.model.js');
const Room = require('../../model/room.model.js');
const Reservation = require('../../model/reservation.model.js'); // assumed schema includes room, date, time, name, anonymous, userID
const Error = require('../../model/errors.model.js');

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
        await Error.create({
            errorMessage: `User not found: ${studentID}`
        });
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.type !== 'student') {
        await Error.create({
            errorMessage: `User is not a student: ${studentID}`
        });
        return res.status(403).json({ error: 'User is not a student' });
    }

    // Fetch recent reservations (e.g., last 5), newest first
    const recentReservations = await Reservation.find({ userID: studentID })
      .populate('roomID')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalThisMonth = await Reservation.countDocuments({
      userID: studentID,
      createdAt: { $gte: startOfMonth }
    });

    const activeReservations = await Reservation.countDocuments({
      userID: studentID,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    res.render('student/dashboard', {
      layout: 'student',
      title: 'GoKoLab Student Dashboard',
      stylesheets: ['dashboard.css'],
      user,
      activeDashboard: true,
      recentReservations,
      totalThisMonth,
      activeReservations
    });
  } catch (error) {
    await Error.create({
        errorMessage: `Failed to fetch user: ${studentID}`
    });
    console.error('Error fetching user or reservations:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/student/reserve/:id', async (req, res) => {
    const studentID = req.params.id;

    try {
        const user = await User.findOne({ _id: studentID }).lean();
        if (!user) {
            await Error.create({
                errorMessage: `User not found: ${studentID}`
            });
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.type !== 'student') {
            await Error.create({
                errorMessage: `User is not a student: ${studentID}`
            });
            return res.status(403).json({ error: 'User is not a student' });
        }

        const rooms = await Room.find({}).lean();
        const dates = getNext7DatesExcludingSundays();

        const times = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];

        res.render('student/reserve', {
            layout: 'student',
            title: 'GoKoLab Student Dashboard - Reserve',
            stylesheets: ['reserve.css'],
            scripts: ['reserve.js'],
            user,
            rooms,
            dates,
            times,
            activeReserve: true
        });
    } catch (error) {
        await Error.create({
            errorMessage: `Failed to fetch user: ${studentID}`
        });
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/student/reserve/:id', async (req, res) => {
  const studentID = req.params.id;
  const { room, date, time, name = '', anonymous = false } = req.body;

  if (!room || !date || !time) {
    return res.status(400).json({ success: false, message: 'Room, date, and time are required.' });
  }

  try {
    
    const user = await User.findById(studentID);
    if (!user) {
      await Error.create({
        errorMessage: `Student not found: ${studentID}`
      });
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (user.type !== 'student') {
      await Error.create({
        errorMessage: `User is not a student: ${studentID}`
      });
      return res.status(403).json({ error: 'User is not a student' });
    }

    const roomDoc = await Room.findOne({ roomName: room });
    if (!roomDoc) {
      await Error.create({
        errorMessage: `Invalid room selected: ${room}`
      });
      return res.status(400).json({ success: false, message: 'Invalid room selected.' });
    }

    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) {
      await Error.create({
        errorMessage: `Invalid date: ${date}`
      });
      return res.status(400).json({ success: false, message: 'Invalid date.' });
    }

    const timeSlot = time; 
    const displayName = anonymous || !name.trim() ? 'Anonymous' : name.trim();

    const existing = await Reservation.findOne({
      roomID: roomDoc._id,
      reservationDate,
      timeSlot
    });
    if (existing) {
      await Error.create({
        errorMessage: `User tried to reserve a slot that is already reserved: ${studentID} ${room} ${date} ${time}`
      });
      return res.status(409).json({ success: false, message: 'That slot is already reserved.' });
    }

    const maxReservations = roomDoc.roomSlots;
    const existingReservationsCount = await Reservation.countDocuments({
      roomID: roomDoc._id,
      reservationDate,
      timeSlot
    });
    if (existingReservationsCount >= maxReservations) {
      return res.status(400).json({ success: false, message: 'That slot is already full.' });
    }

    const reservation = new Reservation({
      roomID: roomDoc._id,
      reservationDate,
      timeSlot,
      name: displayName,
      anonymous: !!anonymous,
      userID: studentID
    });

    try {
        await reservation.save();
    } catch (err) {
        if (err.code === 11000) {
            await Error.create({
                errorMessage: `User tried to reserve a slot that is already reserved: ${studentID} ${room} ${date} ${time}`
            });

            return res.status(409).json({ success: false, message: 'That slot is already reserved.' });
        }
        throw err;
    }

    const totalReservations = await Reservation.countDocuments({
        roomID: roomDoc._id,
        reservationDate,
        timeSlot
    });

    if (totalReservations > maxReservations) {
        await Reservation.deleteOne({
            _id: reservation._id
        });

        await Error.create({
            errorMessage: `Slot is already full: ${studentID} ${room} ${date} ${time}`
        });
        return res.status(400).json({ success: false, message: 'That slot is already full.' });
    }

    return res.json({ success: true, reservation });
  } catch (err) {
    if (err.code === 11000) {
      await Error.create({
        errorMessage: `User tried to reserve a slot that is already reserved: ${studentID} ${room} ${date} ${time}`
      });
      return res.status(409).json({ success: false, message: 'That slot is already reserved.' });
    }
    console.error('Error creating reservation:', err);
    await Error.create({
        errorMessage: `Internal server error: ${studentID} ${room} ${date} ${time}`
    });
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE Reservation
router.post('/student/delete/:id', async (req, res) => {
  const reservationId = req.params.id;
  const userID = req.body.userId;

  const user = await User.findById(userID);
  if (!user) {
    await Error.create({
      errorMessage: `User not found: ${userID}`
    });
    return res.status(404).send('User not found.');
  }

  if (user.type !== 'student') {
    await Error.create({
      errorMessage: `User is not a student: ${userID}`
    });
    return res.status(403).send('User is not a student.');
  }

  try {
    const deleted = await Reservation.findByIdAndDelete(reservationId);
    if (!deleted) {
      await Error.create({
        errorMessage: `Reservation not found: ${reservationId}`
      });
      return res.status(404).send('Reservation not found.');
    }

    if (!userID) {
      await Error.create({
        errorMessage: `Missing user ID: ${userID}`
      });
      return res.status(400).send('Missing user ID.');
    }

    res.redirect(`/student/dashboard/${userID}`);
  } catch (err) {
    console.error('Error deleting reservation:', err);
    await Error.create({
        errorMessage: `Server error during deletion: ${reservationId}`
    });
    res.status(500).send('Server error during deletion.');
  }
});

router.get('/student/profile/:id', async (req, res) => {
    const studentID = req.params.id;

    try {
        const user = await User.findOne({ _id: studentID }).lean();
        if (!user) {
            await Error.create({
                errorMessage: `User not found: ${studentID}`
            });
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.type !== 'student') {
            await Error.create({
                errorMessage: `User is not a student: ${studentID}`
            });
            return res.status(403).json({ error: 'User is not a student' });
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
        await Error.create({
            errorMessage: `Failed to fetch user: ${studentID}`
        });
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
        if (!user) {
            await Error.create({
                errorMessage: `User not found: ${userID}`
            });
            return res.status(404).send('User not found');
        }

        if (user.type !== 'student') {
            await Error.create({
                errorMessage: `User is not a student: ${userID}`
            });
            return res.status(403).send('User is not a student');
        }

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
        await Error.create({
            errorMessage: `Failed to update profile: ${userID}`
        });
        console.error('Profile update error:', err);
        res.status(500).send('Failed to update profile');
    }
});

router.post('/student/delete-account/:id', async (req, res) => {
    try {
        const userID = req.params.id;
        const user = await User.findById(userID);
        if (!user) {
            await Error.create({
                errorMessage: `User not found: ${userID}`
            });
        }

        if (user.type !== 'student') {
            await Error.create({
                errorMessage: `User is not a student: ${userID}`
            });
            return res.status(403).send('User is not a student');
        }

        // Delete reservations linked to user
        await Reservation.deleteMany({ userID });

        // Delete user
        await User.findByIdAndDelete(userID);

        // Optionally destroy session or clear cookies here

        res.redirect('/'); // or to login screen
    } catch (err) {
        await Error.create({
            errorMessage: 'Failed to delete account'
        });
        console.error('Error deleting account:', err);
        res.status(500).send('Failed to delete account');
    }
});

router.get('/student/search', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        await Error.create({
            errorMessage: `User not found: ${userID}`
        });
        return res.status(401).send('Unauthorized');
    }

    if (user.type !== 'student') {
        await Error.create({
            errorMessage: `User is not a student: ${userID}`
        });
        return res.status(403).send('User is not a student');
    }
    res.render('student/search', {
        layout: 'student',
        title: 'Search User Profile',
        stylesheets: ['search.css', 'dashboard.css'],
        activeSearch: true,
        user: req.session.user
    });
});

router.post('/student/search', async (req, res) => {
    const { email } = req.body;

    const user = req.session.user;
    if (!user) {
        await Error.create({
            errorMessage: `User not found: ${userID}`
        });
        return res.status(401).send('Unauthorized');
    }

    if (user.type !== 'student') {
        await Error.create({
            errorMessage: `User is not a student: ${userID}`
        });
        return res.status(403).send('User is not a student');
    }

    try {
        const users = await User.find({ email: { $regex: email, $options: 'i' } }).lean();

        const renderData = {
            layout: 'student',
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

        res.render('student/search', renderData);
    } catch (error) {
        await Error.create({
            errorMessage: 'Search error'
        });
        console.error('Search error:', error);
        res.render('student/search', {
            layout: 'student',
            title: 'Search User Profile',
            error: 'Something went wrong.',
            stylesheets: ['search.css', 'dashboard.css'],
            activeSearch: true,
            user: req.session.user
        });
    }
});

router.get('/student/otherprofile/:id', async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
        await Error.create({
            errorMessage: `User not found: ${id}`
        });
        return res.status(404).send('User not found.');
    }

    if (user.type !== 'student') {
        await Error.create({
            errorMessage: `User is not a student: ${id}`
        });
        return res.status(403).send('User is not a student');
    }

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
        await Error.create({
            errorMessage: 'Error loading other profile'
        });
        console.error('Error loading other profile:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
