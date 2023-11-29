const joi = require('joi')

const updateTripReqValidate = (data) => {
    const rules = joi.object({
        tripId: joi.string().required(),
        coverPicture: joi.string().optional(),
        title: joi.string().optional(),
        description: joi.string().optional(),
        locations: joi.array().optional(),
        startTime: joi.string().optional(),
        endTime: joi.string().optional(),
        expectedBudget: joi.number().optional()
    })
    return rules.validate(data);
}

const editMemberReqValidate = (data) => {
    const rules = joi.object({
        members: joi.array().items(joi.string()).required()
    })
    return rules.validate(data);
}

module.exports = {
    updateTripReqValidate,
    editMemberReqValidate
}