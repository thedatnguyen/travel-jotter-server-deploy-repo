const express = require('express');
const router = express.Router();

const tokenVerify = require('../middlewares/tokenVerify');
const timeSectionController = require('../controllers/timeSectionController');

router.route('/').all(tokenVerify)
    .get(timeSectionController.getAllTimeSection)
    .post(timeSectionController.createTimeSections)

router.route('/:timeSectionId').all(tokenVerify)
    .get(timeSectionController.getTimeSectionById)
    .post(timeSectionController.updateTimeSection)
    .delete(timeSectionController.deleteTimeSection)

module.exports = router;