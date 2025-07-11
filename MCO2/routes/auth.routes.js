const express = require('express');
const router = express.Router();

const User = require('../model/user.model.js');

router.get('/', (req, res) => {
    res.render('login', {
        layout: 'main',
        title: 'Welcome to GokoLab',
        stylesheets: ['index.css'],
        scripts: ['index.js']
    });
});

router.post('/login', async (req, res) => {
    const formData = req.body;
    console.log('Form Data:', formData);

    const isExistingEmail = await User.findOne({email: formData.email});
    if (!isExistingEmail) {
        return res.render('login', {
            layout: 'main',
            title: 'Welcome to GokoLab',
            stylesheets: ['index.css'],
            scripts: ['index.js'],
            email: formData.email,
            errors: {email: 'Email not found'}
        });
    }

    const isValidPassword = await isExistingEmail.comparePassword(formData.password);
    if (!isValidPassword) {
        return res.render('login', {
            layout: 'main',
            title: 'Welcome to GokoLab',
            stylesheets: ['index.css'],
            scripts: ['index.js'],
            email: formData.email,
            errors: {password: 'Incorrect password'}
        });
    }

    console.log('User logged in successfully:', isExistingEmail);
    res.redirect('/student/dashboard');
});

router.get('/forgot', (req, res) => {
    res.render('forgot', {
        layout: 'main',
        title: 'Forgot Password',
        stylesheets: ['forgot_pass.css'],
        scripts: ['forgot_pass.js']
    });
});

router.get('/register', (req, res) => {
    res.render('register', {
        layout: 'main',
        title: 'Register to GokoLab',
        stylesheets: ['register.css'],
        scripts: ['register.js']
    });
});

router.post('/register', async (req, res) => {
    const formData = req.body;
    console.log('Registration Data:', formData); //Remove after

    const newUser = new User(formData);

    const existingUser = await User.findOne({ email: newUser.email });
    if (existingUser) {
        console.log('User already exists:', existingUser);
        return res.status(409).json({ success: false, message: 'User already exists' });
    }

    try {
        newUser.password = await newUser.hashPassword(newUser.password);
        await newUser.save();
        console.log('User saved successfully:', newUser);
        return res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Error saving user:', error);
        return res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

module.exports = router;