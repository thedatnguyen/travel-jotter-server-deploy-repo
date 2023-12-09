const joi = require('joi');

const createTimeSectionsReqValidate = (data) => {
	const rules = joi.object({
		tripId: joi.string().required(),
		timeSectionsData: joi.array().items(joi.object({
			startTime: joi.string().required(),
			endTime: joi.string().required()
		})).required()
	});
	return rules.validate(data);
};

const updateTimeSectionsReqValidate = (data) => {
	const rules = joi.object({
		updateData: joi.object({
			startTime: joi.string().optional(),
			endTime: joi.string().optional()
		})
	});
	return rules.validate(data);
};

module.exports = {
	createTimeSectionsReqValidate,
	updateTimeSectionsReqValidate
};