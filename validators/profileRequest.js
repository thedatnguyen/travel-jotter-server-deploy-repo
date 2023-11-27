const joi = require('joi');

const updateAvatarReqValidate = (data) => {
    const rules = joi.object({
        picture: joi.string().required()
    })
    return rules.validate(data);
}

const updateInformationReqValidate = (data) => {
    const rules = joi.object({
        username: joi.string().optional(),
        gender: joi.string().optional(),
        phoneNumber: joi.number().optional(),
        firstName: joi.string().optional(),
        lastName: joi.string().optional(),
    })
    return rules.validate(data);
}

const changePasswordReqValidate = (data) => {
    const rules = joi.object({
        oldPassword: joi.string().allow('').optional(),
        newPassword: joi.string()
            .pattern(new RegExp("^[a-zA-Z0-9_@]{6,20}$")).required(),
    })
    return rules.validate(data);
}

module.exports = {
    updateAvatarReqValidate,
    updateInformationReqValidate,
    changePasswordReqValidate
}