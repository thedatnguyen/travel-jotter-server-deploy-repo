const { timeSectionService } = require('../services/timeSectionService');
const val = require('../validators/timeSectionRequest');

const errorHandler = (response, error, code) => {
    console.log(error);
    return response.status(code).send({
        message: error.message,
        tokens: response.locals.tokens
    })
}

const getAllTimeSection = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.query;
        const { result, error } = await timeSectionService.getAllTimeSectionFromTrip(email, tripId);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const createTimeSections = async (req, res) => {
    try {
        const { email } = res.locals.account;

        const { error: err } = val.createTimeSectionsReqValidate(req.body);
        if(err) return errorHandler(res, err.details[0], 422);

        const { tripId, timeSectionsData } = req.body;
        const { result, error } = await timeSectionService.createTimeSections(email, tripId, timeSectionsData);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const updateTimeSection = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { timeSectionId } = req.params;

        const { error: err } = val.updateTimeSectionsReqValidate(req.body);
        if(err) return errorHandler(res, err.details[0], 422);
        
        const { updateData } = req.body;
        const { result, error } = await timeSectionService.updateTimeSection(email, timeSectionId, updateData);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const getTimeSectionById = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { timeSectionId } = req.params;
        const { result, error } = await timeSectionService.getTimeSectionById(email, timeSectionId);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const deleteTimeSection = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { timeSectionId } = req.params;
        const { result, error } = await timeSectionService.deleteTimeSection(email, timeSectionId);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result: { timeSectionId: result.timeSectionId },
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

module.exports = {
    getAllTimeSection,
    createTimeSections,
    updateTimeSection,
    getTimeSectionById,
    deleteTimeSection
}