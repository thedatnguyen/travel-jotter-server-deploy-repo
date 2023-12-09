var express = require('express');
var router = express.Router();

const commentController = require('../controllers/commentController');
const tokenVerify = require('../middlewares/tokenVerify');

router.route('/').all(tokenVerify)
	.get(commentController.getCommentsOfActivity)
	.post(commentController.createComment)
	.patch(commentController.editComment)
	.delete(commentController.deleteComment);

module.exports = router;