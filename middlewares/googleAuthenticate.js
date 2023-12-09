const passport = require('passport');

module.exports.getProfile = passport.authenticate('google', {
	scope: ['profile', 'email'],
	failureRedirect: '/auth/google',
	failureMessage: 'Signing sucess, redirecting ...'
});

module.exports.getSession = passport.authenticate('google', {
	session: true,
	failureRedirect: '/auth/google',
	failureMessage: 'Signing sucess, redirecting ...'
});
