const express = require('express');
const router = express.Router();

const tokenVerify = require('../middlewares/tokenVerify');
const profileController = require('../controllers/profileController');

router.patch('/', tokenVerify, profileController.updateInformation);
router.patch('/picture', tokenVerify, profileController.updateAvatar);
router.post('/password', tokenVerify, profileController.changePassword);
router.route('/resetViaEmail')
    .get(profileController.sendEmailResetPassword)
    .post(profileController.resetPasswordFromEmail)

module.exports = router;
