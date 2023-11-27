const express = require('express');
const router = express.Router();

const tokenVerify = require('../middlewares/tokenVerify');
const wishController = require('../controllers/wishActivityController');

router.route('/').all(tokenVerify)
    .get(wishController.getAllWishActivityFromTrip)
    .post(wishController.createWishActivity)
    .patch(wishController.updateWishActivity)
    .delete(wishController.deleteWishActivity)

router.post('/timeSection', tokenVerify, wishController.pushWishActivityToTimeSection);

module.exports = router;