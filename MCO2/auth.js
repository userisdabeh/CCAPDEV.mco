function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.redirect('/');
}

module.exports = isAuthenticated;

//remember-me
module.exports = (req, res, next) => {
    if (req.session.userId) return next();

    if (req.cookies.remember) {
        req.session.userId = req.cookies.remember;

        // Refresh the cookie for another 3 weeks
        res.cookie('remember', req.cookies.remember, {
            maxAge: 1000 * 60 * 60 * 24 * 21, // reset 3 weeks
            httpOnly: true
        });

        return next();
    }

    // No session and no cookie: force login
    res.redirect('/');
};

