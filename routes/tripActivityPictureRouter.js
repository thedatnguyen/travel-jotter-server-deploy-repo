const express = require('express');
const router = express.Router();

const tokenVerify = require('../middlewares/tokenVerify');
const tripActivityPictureController = require('../controllers/tripActivityPictureController');

router.route('/').all(tokenVerify)
	.get(tripActivityPictureController.getAllTripPicture)
	.post(tripActivityPictureController.addTripPicture)
	.patch(tripActivityPictureController.changeActivityTagsForTripPicture)
	.delete(tripActivityPictureController.deleteTripPicture);

module.exports = router;