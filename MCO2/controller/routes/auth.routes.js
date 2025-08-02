const express = require('express');
const router = express.Router();

const User = require('../../model/user.model.js');
const isDlsuEmail = (email) => /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/.test(email);
const isStrongPassword = (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(pw);

REMEMBER_MAX_AGE =  1000 * 60 * 60 * 24 * 21, //3 weeks

router.get('/', async (req, res) => {
    if (!req.session.user && req.cookies.remember){
        try {
            const isExistingEmail= await User.findById(req.cookies.remember);
            if (isExistingEmail) {
                req.session.user = {
                    _id: isExistingEmail._id,
                    email: isExistingEmail.email,
                    firstName: isExistingEmail.firstName,
                    lastName: isExistingEmail.lastName
                };

            // Refresh cookie
                res.cookie('remember', isExistingEmail._id.toString(), {
                    maxAge: REMEMBER_MAX_AGE,
                    httpOnly: true
                });

            return res.redirect(`/student/dashboard/${isExistingEmail._id}`);
            }
        } catch (err) {
            console.error('Invalid remember cookie:', err);
        }
    }
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

    req.session.user = {
        _id: isExistingEmail._id,
        email: isExistingEmail.email,
        firstName: isExistingEmail.firstName,
        lastName: isExistingEmail.lastName,
        type: isExistingEmail.type
    }

    //if choose remember me
    if (formData.remember === 'on') {
        console.log('Remember me is on');
        res.cookie('remember', isExistingEmail._id.toString(), {
            maxAge: REMEMBER_MAX_AGE,
            httpOnly: true
        });
    }

    console.log('User logged in successfully:', req.session.user);

    console.log('User logged in successfully:', isExistingEmail);
    //res.redirect(`/student/dashboard/${isExistingEmail._id}`);
     if (isExistingEmail.type === 'technician') {
        return res.redirect(`/tech/dashboard/${isExistingEmail._id}`);
    } else {
        return res.redirect(`/student/dashboard/${isExistingEmail._id}`);
    }
});

// GET forgot password
router.get('/forgot', (req, res) => {
    res.render('forgot', {
        layout: 'main',
        title: 'Forgot Password',
        stylesheets: ['forgot_pass.css'],
        scripts: ['forgot_pass.js']
    });
});

router.post('/forgot', async (req, res) => {
    const { email = '', password = '', confirmPassword = '' } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const wantsJson = req.xhr || req.headers.accept?.includes('application/json');

    // Collect validation errors
    const errors = {};

    if (!isDlsuEmail(normalizedEmail)) {
        errors.email = 'Enter a valid DLSU email';
    }

    if (!isStrongPassword(password)) {
        errors.password = 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.';
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
        if (wantsJson) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }
        return res.render('forgot', {
            layout: 'main',
            title: 'Forgot Password',
            stylesheets: ['forgot_pass.css'],
            scripts: ['forgot_pass.js'],
            error: 'Please fix the errors below.',
            errors
        });
    }

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            const msg = 'Email not found in our system';
            if (wantsJson) {
                return res.status(404).json({ success: false, message: msg });
            }
            return res.render('forgot', {
                layout: 'main',
                title: 'Forgot Password',
                stylesheets: ['forgot_pass.css'],
                scripts: ['forgot_pass.js'],
                error: msg
            });
        }

        // Update password
        user.password = await user.hashPassword(password);
        await user.save();
        console.log('Password updated successfully for user:', user.email);

        if (wantsJson) {
        return res.json({ success: true, message: 'Password updated.' });
        }
        return res.redirect('/');
    } catch (error) {
        console.error('Error updating password:', error);
        const msg = 'Failed to update password. Please try again.';
        if (wantsJson) {
            return res.status(500).json({ success: false, message: msg });
        }
        return res.render('forgot', {
            layout: 'main',
            title: 'Forgot Password',
            stylesheets: ['forgot_pass.css'],
            scripts: ['forgot_pass.js'],
            error: msg
        });
    }
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

router.get('/logout', (req, res) => {
    res.clearCookie('remember');
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
    });
    res.redirect('/');
});

module.exports = router;
