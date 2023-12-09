const { commentService } = require('../services/commentService');
const val = require('../validators/commentRequest');

const errorHandler = (response, error, code) => {
	console.log(error);
	return response.status(code).send({
		message: error.message,
		tokens: response.locals.tokens
	});
};

const getCommentsOfActivity = async (req, res) => {
	try {
		const { email } = res.locals.account;
		const { activityId } = req.query;
		const { error, result } = await commentService.getCommentsInActivity(email, activityId);
		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result: result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const createComment = async (req, res) => {
	try {
		const { email } = res.locals.account;

		const { error: err } = val.addComment(req.body);
		if(err) return errorHandler(res, err.details[0], 422);

		const { commentData } = req.body;
		const { error, result } = await commentService.createComment(email, commentData);
		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result: result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const editComment = async (req, res) => {
	try {
		const { email } = res.locals.account;

		const { error: err } = val.editComment(req.body);
		if(err) return errorHandler(res, err.details[0], 422);

		const { commentUpdateData } = req.body;
		const { error, result } = await commentService.editComment(email, commentUpdateData);
		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result: result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const deleteComment = async (req, res) => {
	try {
		const { email } = res.locals.account;
		const { commentId } = req.query;
		const { error, result } = await commentService.deleteComment(email, commentId);
		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result: result.commentId,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

module.exports = {
	getCommentsOfActivity,
	createComment,
	editComment,
	deleteComment
};