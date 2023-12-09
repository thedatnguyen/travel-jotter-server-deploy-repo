const { activityService } = require('../services/activityService');
const val = require('../validators/activityRequest');

const errorHandler = (response, error, code) => {
	console.log(error);
	return response.status(code).send({
		message: error.message,
		tokens: response.locals.tokens
	});
};

const getActivities = async (req, res) => {
	try {
		const { email } = res.locals.account;
		const { timeSectionId } = req.query;
		const { error, result } = await activityService.getActivities(email, timeSectionId);
		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const createActivities = async (req, res) => {
	try {
		const { email } = res.locals.account;

		const { error: err } = val.createActivitesReqValidate(req.body);
		if (err) return errorHandler(res, err.details[0], 422);

		const { timeSectionId, activitiesData } = req.body;
		const { result, error } = await activityService.createActivites(email, timeSectionId, activitiesData);
		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const updateActivities = async (req, res) => {
	try {
		const { email } = res.locals.account;

		const { error: err } = val.updateActivitiesReqValidate(req.body);
		if (err) return errorHandler(res, err.details[0], 422);

		const { timeSectionId, activitiesUpdateData } = req.body;
		const { result, error } = await activityService.updateActivities(email, timeSectionId, activitiesUpdateData);
		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const deleteActivity = async (req, res) => {
	try {
		const { email } = res.locals.account;
		const { activityId, moveToWish } = req.query;

		let result, error;

		if (moveToWish == 'true') {
			const moveActivity = await activityService.moveActivityToWishList(email, activityId);
			result = moveActivity.result;
			error = moveActivity.error;
		} else {
			const deleteActivity = await activityService.deleteActivityById(email, activityId);
			result = deleteActivity.result;
			error = deleteActivity.error;
		}

		if (error) return errorHandler(res, error, 400);
		res.status(200).send({
			result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

module.exports = {
	getActivities,
	createActivities,
	updateActivities,
	deleteActivity
};