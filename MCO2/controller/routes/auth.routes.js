const express = require('express');
const router = express.Router();

const User = require('../../model/user.model.js');

REMEMBER_MAX_AGE =  1000 * 60 * 60 * 24 * 21, //3 weeks

router.get('/', async (req, res) => {
    if (!req.session.User && req.cookies.remember){
        try {
            const isExistingEmail= await User.findById(req.cookies.remember);
            if (isExistingEmail) {
                req.session.isExistingEmail = {
                    _id: isExistingEmail._id,
                    email: isExistingEmail.email,
                    firstName: isExistingEmail.firstName,
                    lastName: isExistingEmail.lastName,
                    type: isExistingEmail.type
                };

            // Refresh cookie
                res.cookie('remember', isExistingEmail._id.toString(), {
                    maxAge: REMEMBER_MAX_AGE,
                    httpOnly: true
                });
            
            //Redirects user based on type of user
            if (isExistingEmail.type === 'technician') {
                    return res.redirect(`/tech/dashboard/${isExistingEmail._id}`);
                } else {
                    return res.redirect(`/student/dashboard/${isExistingEmail._id}`);
                }
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

router.get('/forgot', (req, res) => {
    res.render('forgot', {
        layout: 'main',
        title: 'Forgot Password',
        stylesheets: ['forgot_pass.css'],
        scripts: ['forgot_pass.js']
    });
});

router.post('/forgot', async (req, res) => {
    const formData = req.body;
    console.log('Forgot Password Data:', formData);
    
    // Check if user exists
    const user = await User.findOne({ email: formData.email });
    if (!user) {
        return res.render('forgot', {
            layout: 'main',
            title: 'Forgot Password',
            stylesheets: ['forgot_pass.css'],
            scripts: ['forgot_pass.js'],
            error: 'Email not found in our system'
        });
    }
    
    // Update user's password
    try {
        user.password = await user.hashPassword(formData.password);
        await user.save();
        console.log('Password updated successfully for user:', user.email);
        
        // Redirect to login page with success message
        res.redirect('/');
    } catch (error) {
        console.error('Error updating password:', error);
        res.render('forgot', {
            layout: 'main',
            title: 'Forgot Password',
            stylesheets: ['forgot_pass.css'],
            scripts: ['forgot_pass.js'],
            error: 'Failed to update password. Please try again.'
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