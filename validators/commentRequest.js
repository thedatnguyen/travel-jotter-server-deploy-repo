const joi = require('joi')

const addComment = (data) => {
    const rules = joi.object({
        commentData: joi.object({
            activityId: joi.string().required(),
            content: joi.string().required(),
            published: joi.boolean().optional()
        })
    })
    return rules.validate(data);
}

const editComment = (data) => {
    const rules = joi.object({
        commentUpdateData: joi.object({
            commentId: joi.string().required(),
            content: joi.string().optional(),
            published: joi.boolean().optional()
        })
    })
    return rules.validate(data);
}


module.exports = {
    addComment,
    editComment
}