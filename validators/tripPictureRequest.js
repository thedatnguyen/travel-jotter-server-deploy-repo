const joi = require('joi')

const addTripPictureReqValidate = (data) => {
    const rules = joi.object({
        tripPicture: joi.string().required()
    })
    return rules.validate(data);
}

const addActivityToPictureReqValidate = (data) => {
    const rules = joi.object({
        tripPicture: joi.string().required(),
        activityId: joi.string().required()
    })
    return rules.validate(data);
}

module.exports = {
    addTripPictureReqValidate,
    addActivityToPictureReqValidate
}