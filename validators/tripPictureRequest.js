const joi = require('joi')

const addTripPictureReqValidate = (data) => {
    const rules = joi.object({
        tripPicture: joi.object({
            picture: joi.string().required(),
            tripId: joi.string().required(),
            activityId: joi.string().optional()
        }).required()
    })
    return rules.validate(data);
}

const changeActivityToPictureReqValidate = (data) => {
    const rules = joi.object({
        tripPicture: joi.string().required(),
        activityId: joi.string().optional().allow(null)
    })
    return rules.validate(data);
}

module.exports = {
    addTripPictureReqValidate,
    changeActivityToPictureReqValidate
}