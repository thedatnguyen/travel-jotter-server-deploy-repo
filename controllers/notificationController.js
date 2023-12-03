const { notificationService } = require('../services/notificationService');

const errorHandler = (response, error, code) => {
    console.log(error);
    return response.status(code).send({
        message: error.message,
        tokens: response.locals.tokens
    })
}

const getAllNoti = async (req, res, next) => {
    try {
        const { email } = res.locals.account;
        const { error, result } = await notificationService.getAllNoti(email);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const deleteNoti = async (req, res, next) => {
    try {
        const { email } = res.locals.account;
        const { notificationId } = req.params;
        const { error, result } = await notificationService.removeNoti(email, notificationId);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

module.exports = {
    getAllNoti,
    deleteNoti
}