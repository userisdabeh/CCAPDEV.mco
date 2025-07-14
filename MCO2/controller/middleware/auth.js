function isAuthenticated(req, res, next) {
    // If session exists, move on
    if (req.session && req.session.user) {
        console.log('Session found:', req.session.user);
        return next();
    }

    // If remember cookie exists, restore session
    if (req.cookies && req.cookies.remember) {
        console.log('Remember cookie found, restoring session');
        req.session.user = { _id: req.cookies.remember };

        // Refresh cookie
        res.cookie('remember', req.cookies.remember, {
            maxAge: 1000 * 60 * 60 * 24 * 21, // 3 weeks
            httpOnly: true
        });

        return next();
    }

    // No session or remember cookie
    console.log('No session or remember cookie found, redirecting to login');
    return res.redirect('/');
}

module.exports = isAuthenticated;