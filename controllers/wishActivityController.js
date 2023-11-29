const { wishActivityService } = require('../services/wishActivityService');
const val = require('../validators/wishActivityRequest');

const errorHandler = (response, error, code) => {
    console.log(error);
    return response.status(code).send({
        message: error.message,
        tokens: response.locals.tokens
    })
}

const getAllWishActivityFromTrip = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.query;
        const { error, result } = await wishActivityService.getAllWishActivityFromTrip(email, tripId);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result: result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const createWishActivity = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { wishActivityData } = req.body;

        const { error: err } = val.createWish(wishActivityData);
        if (err) return errorHandler(res, err.details[0], 422);

        const { error, result } = await wishActivityService.createWishActivity(email, wishActivityData);

        if (error) return errorHandler(res, error, 400);

        res.status(200).send({
            result: result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const updateWishActivity = async (req, res) => {
    try {
        const { email } = res.locals.account;

        const { error: err } = val.updateWish(req.body);
        if (err) return errorHandler(res, err.details[0], 422);

        const { tripId, wishesDataUpdate } = req.body;
        const { error, result } = await wishActivityService.updateWishActivity(email, tripId, wishesDataUpdate);
        if (error) return errorHandler(res, error, 400);

        res.status(200).send({
            result: result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const deleteWishActivity = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { wishActivityId } = req.query;
        const { error, result } = await wishActivityService.deleteWishActivity(email, wishActivityId);

        if (error) return errorHandler(res, error, 400);

        res.status(200).send({
            result: result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const pushWishActivityToTimeSection = async (req, res) => {
    try {
        const { email } = res.locals.account;

        const { error: err } = val.pushToTimeSection(req.body);
        if (err) return errorHandler(res, err.details[0], 422);

        const { timeSectionId, wishActivityId, order } = req.body;
        const { error, result } = await wishActivityService.pushWishActivityToTimeSection(email, timeSectionId, wishActivityId, order);

        if (error) return errorHandler(res, error, 400);

        res.status(200).send({
            result: result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

module.exports = {
    getAllWishActivityFromTrip,
    createWishActivity,
    updateWishActivity,
    deleteWishActivity,
    pushWishActivityToTimeSection
}
