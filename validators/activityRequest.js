const joi = require('joi');

const createActivitesReqValidate = (data) => {
	const rules = joi.object({
		timeSectionId: joi.string().required(),
		activitiesData: joi.array().items(joi.object({
			title: joi.string().required(),
			note: joi.string().allow('').optional(),
			budget: joi.number().optional(),
			location: joi.string().required(),
			category: joi.string().required(),
			order: joi.number().required()
		})).required()
	});
	return rules.validate(data);
};
const updateActivitiesReqValidate = (data) => {
	const rules = joi.object({
		timeSectionId: joi.string().required(),
		activitiesUpdateData: joi.array().items(joi.object({
			activityId: joi.string().required(),
			title: joi.string().optional(),
			note: joi.string().allow('').optional(),
			budget: joi.number().optional(),
			location: joi.string().optional(),
			category: joi.string().optional(),
			order: joi.number().optional()
		}))
	});
	return rules.validate(data);
};

module.exports = {
	createActivitesReqValidate,
	updateActivitiesReqValidate,
};
