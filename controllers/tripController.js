const { Worker } = require('worker_threads');

const { tripService } = require('../services/tripService');
const val = require('../validators/tripRequest');
const errorHandler = (response, error, code) => {
    console.log(error);
    return response.status(code).send({
        message: error.message,
        tokens: response.locals.tokens
    })
}

const createTrip = async (req, res, next) => {
    try {
        let trip = req.body;
        trip.owner = res.locals.account.email;
        const { error, result } = await tripService.createTrip(trip)
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const getAllTrip = async (req, res, next) => {
    try {
        const { email } = res.locals.account;
        const { error, result } = await tripService.getAllTrip(email)
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const getTripById = async (req, res, next) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.params;
        const { error, result } = await tripService.getTripById(email, tripId);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const deleteTrip = async (req, res, next) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.params;
        const { error, result } = await tripService.deleteTripById(tripId, email);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const updateTrip = async (req, res, next) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.params;
        const trip = req.body;
        trip.tripId = tripId;

        const { error: err } = val.updateTripReqValidate(trip);
        if (err) return errorHandler(res, err.details[0], 422);

        const { error, result } = await tripService.updateTrip(email, trip);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const getAllMember = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.params;
        const { error, result } = await tripService.getAllMember(email, tripId);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const editMember = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.params;

        const { error: err } = val.editMemberReqValidate(req.body)
        if (err) return errorHandler(res, err.details[0], 422)

        const { members } = req.body;
        const { error, result } = await tripService.editMember(email, members, tripId)
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const removeSelfFromTrip = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.params;
        const { error, result } = await tripService.removeSelf(email, tripId);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result,
            tokens: res.locals.tokens
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const generateSuggestion = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { tripId } = req.params;

        const workerData = { email, tripId };
        const worker = new Worker(
            `${global.__path_background_workers}/generateSuggest.js`,
            { workerData: workerData }
        )

        worker.on('message', result => {
            res.status(200).send({
                result,
                tokens: res.locals.tokens
            })
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

module.exports = {
    createTrip,
    getAllTrip,
    getTripById,
    deleteTrip,
    updateTrip,
    getAllMember,
    editMember,
    removeSelfFromTrip,
    generateSuggestion
}