const express = require('express');
const router = express.Router();

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

module.exports = router;