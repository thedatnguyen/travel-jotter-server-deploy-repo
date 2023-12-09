const express = require('express');
const router = express.Router();

const tokenVerify = require('../middlewares/tokenVerify');
const tripController = require('../controllers/tripController');

router.route('/')
	.get(tokenVerify, tripController.getAllTrip)
	.post(tokenVerify, tripController.createTrip);

router.route('/:tripId')
	.get(tokenVerify, tripController.getTripById)
	.patch(tokenVerify, tripController.updateTrip)
	.delete(tokenVerify, tripController.deleteTrip);

router.route('/:tripId/members').all(tokenVerify)
	.get(tripController.getAllMember)
	.post(tripController.editMember)
	.delete(tripController.removeSelfFromTrip);

router.route('/:tripId/suggestion').all(tokenVerify)
	.post(tripController.generateSuggestion);
    
module.exports = router;
