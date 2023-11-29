const joi = require('joi')

const createWish = (data) => {
    const rules = joi.object({
        tripId: joi.string().required(),
        title: joi.string().required(),
        note: joi.string().optional().allow('').default(''),
        budget: joi.number().optional().default(0),
        location: joi.string().optional().default('no location'),
        category: joi.string().optional().default('others')
    })
    return rules.validate(data);
}

const updateWish = (data) => {
    const rules = joi.object({
        tripId: joi.string().required(),
        wishesDataUpdate: joi.array().items(
            joi.object({
                wishActivityId: joi.string().required(),
                title: joi.string().optional().allow(''),
                note: joi.string().optional().allow(''),
                budget: joi.number().optional(),
                location: joi.string().optional(),
                category: joi.string().optional()
            })
        ).required()
    })
    return rules.validate(data);
}

const pushToTimeSection = (data) => {
    const rules = joi.object({
        wishActivityId: joi.string().required(),
        timeSectionId: joi.string().required(),
        order: joi.number().required()
    })
    return rules.validate(data);
}



module.exports = {
    createWish,
    updateWish,
    pushToTimeSection
}