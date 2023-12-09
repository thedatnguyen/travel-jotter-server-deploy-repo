const express = require('express');
const router = express.Router();

const tokenVerify = require('../middlewares/tokenVerify');
const activityController = require('../controllers/activityController');

router.route('/').all(tokenVerify)
	.get(activityController.getActivities)
	.post(activityController.createActivities)
	.patch(activityController.updateActivities)
	.delete(activityController.deleteActivity);

module.exports = router;