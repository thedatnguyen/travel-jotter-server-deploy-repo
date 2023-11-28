const passport = require('passport');

module.exports.getProfile = passport.authenticate('google', {
    scope: ['profile', 'email']
});

module.exports.getSession = passport.authenticate('google', {
    session: true,
    failureRedirect: '/auth/google'
})
