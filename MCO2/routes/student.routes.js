const express = require('express');
const router = express.Router();

const User = require('../model/user.model.js');

router.get('/student/dashboard/:id', async (req, res) => {
    const studentID = req.params.id;

    console.log(studentID);

    try {
        const user = await User.findOne({ _id: studentID });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.render('student/dashboard', {
            layout: 'student',
            title: 'GoKoLab Student Dashboard',
            stylesheets: ['student.css']
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
})

module.exports = router;