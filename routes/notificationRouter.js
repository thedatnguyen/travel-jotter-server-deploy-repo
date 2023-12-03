const express = require('express');
const router = express.Router();

const tokenVerify = require('../middlewares/tokenVerify');
const notificationController = require('../controllers/notificationController');

router.get('/', tokenVerify, notificationController.getAllNoti);
router.delete('/:notificationId', tokenVerify, notificationController.deleteNoti);

module.exports = router;