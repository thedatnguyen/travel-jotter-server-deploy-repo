const express = require('express');
const router = express.Router();

const googleAuthenticate = require('../middlewares/googleAuthenticate');
const authController = require('../controllers/authController');
const tokenVerify = require('../middlewares/tokenVerify');

router.route('/signup')
	.get(authController.checkEmailDuplicate)
	.post(authController.signUp);
router.get('/verifyEmail/:token', authController.verifyEmail);
router.post('/loginWithPassword', authController.loginWithPassword);
router.get('/google', googleAuthenticate.getProfile);
router.get('/google/callback', googleAuthenticate.getSession, authController.redirectAndSendGrantCode);
router.get('/loginWithGmail', authController.loginWithGmail);
router.post('/logout', tokenVerify, authController.logout);

module.exports = router;
