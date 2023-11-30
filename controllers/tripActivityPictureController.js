const { tripActivityPictureService } = require('../services/tripActivityPictureService');
const val = require('../validators/tripPictureRequest');

const errorHandler = (response, error, code) => {
    console.log(error);
    return response.status(code).send({
        message: error.message,
        tokens: response.locals.tokens
    })
}

const addTripPicture = async (req, res) => {
    try {
        const { email } = res.locals.account;

        const { error: err } = val.addTripPictureReqValidate(req.body);
        if(err) return errorHandler(res, err.details[0], 422);

        const { tripPicture } = req.body;
        const { error, result } = await tripActivityPictureService.addTripPicture(email, tripPicture);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500)
    }
}

const changeActivityTagsForTripPicture = async (req, res) => {
    try {
        const { email } = res.locals.account;

        const { error: err } = val.changeActivityToPictureReqValidate(req.body);
        if(err) return errorHandler(res, err.details[0], 422);
        
        const { pictureId, activityId } = req.body;
        const { error, result } = await tripActivityPictureService.changeActivityTagsForTripPicture(email, pictureId, activityId);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result: result.activityId,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500)
    }
}

const deleteTripPicture = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { pictureId } = req.query;
        const { error, result } = await tripActivityPictureService.deleteTripPicture(email, pictureId);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500)
    }
}

const getAllTripPicture = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { filter, tripId } = req.query;
        if (filter == 'activity') {
            const { error, result } = await tripActivityPictureService.getAllTripPictureAndFilterByActivity(email, tripId);
            if (error) return errorHandler(res, error, 400);
            return res.status(200).send({
                result,
                tokens: res.locals.tokens
            })
        }
        if (filter == 'category') {
            const { error, result } = await tripActivityPictureService.getAllTripPictureAndFilterByCategory(email, tripId);
            if (error) return errorHandler(res, error, 400);
            return res.status(200).send({
                result,
                tokens: res.locals.tokens
            })
        }

        return res.status(400).send({
            message: 'filter type not found',
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500)
    }
}

module.exports = {
    addTripPicture,
    changeActivityTagsForTripPicture,
    deleteTripPicture,
    getAllTripPicture
}
