const { PrismaClient } = require('@prisma/client');

const dropbox = require('../configs/dropbox');

const prisma = new PrismaClient();
const errorHandler = (error) => {
    console.log(error);
    return { error: { message: error.message }, result: undefined }
}

const checkRole = async (email, tripId) => {
    try {
        const shareTrip = await prisma.sharedTrip.findUnique({
            where: { email_tripId: { email: email, tripId: tripId } },
            select: { role: true }
        })
        if (!shareTrip) return undefined;
        return shareTrip.role;
    } catch (error) {
        return undefined;
    }
}

const addTripPicture = async (email, tripPicture) => {
    try {
        await prisma.$connect();
        const role = await checkRole(email, tripPicture.tripId);
        if (role != 'owner') return { error: { message: 'not owner' } };

        const pictureBuffer = Buffer.from(tripPicture.picture, 'base64');
        delete tripPicture.picture;
        const { pictureId, pictureUrl } = await dropbox.uploadImage(pictureBuffer);
        tripPicture.pictureId = pictureId;
        tripPicture.pictureUrl = pictureUrl;

        const result = await prisma.tripPicture.create({
            data: tripPicture
        })
        return {
            result: {
                pictureId: result.pictureId,
                pictureUrl: result.pictureUrl
            }
        }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const deleteTripPicture = async (email, pictureId) => {
    try {
        await prisma.$connect();
        const owner = (await prisma.tripPicture.findUnique({
            where: { pictureId: pictureId },
            select: { Trip: true }
        })).Trip.owner;
        if (owner != email) return { error: { message: 'not owner' } }

        const id = (await prisma.tripPicture.delete({
            where: { pictureId: pictureId },
            select: { pictureId: true }
        })).pictureId;
        return { result: id }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const changeActivityTagsForTripPicture = async (email, pictureId, activityId) => {
    try {
        await prisma.$connect();
        const owner = (await prisma.tripPicture.findUnique({
            where: { pictureId: pictureId },
            select: { Trip: true }
        })).Trip.owner;
        if (owner != email) return { error: { message: 'not owner' } }

        const tripPicture = await prisma.tripPicture.update({
            where: { pictureId: pictureId },
            data: { activityId: activityId }
        })
        return { result: tripPicture }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const getAllTripPictureAndFilterByActivity = async (email, tripId) => {
    try {
        await prisma.$connect();

        const role = await checkRole(email, tripId);
        if (!role) return { error: { message: 'not owner or member' } }

        const tripPictures = await prisma.tripPicture.findMany({
            where: { tripId: tripId },
            select: {
                activityId: true,
                pictureId: true,
                pictureUrl: true
            }
        })
        const result = { _trip: [] }
        for (const tripPicture of tripPictures) {
            if (!tripPicture.activityId) {
                result._trip.push({
                    pictureId: tripPicture.pictureId,
                    pictureUrl: tripPicture.pictureUrl
                })
            } else {
                const activityId = tripPicture.activityId;
                if (!result[activityId]) result[activityId] = [];
                result[activityId].push({
                    pictureId: tripPicture.pictureId,
                    pictureUrl: tripPicture.pictureUrl
                })
            }
        }

        return { result: result }

    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const getAllTripPictureAndFilterByCategory = async (email, tripId) => {
    try {
        await prisma.$connect();

        const role = await checkRole(email, tripId);
        if (!role) return { error: { message: 'not owner or member' } }

        const activities = (await prisma.activity.findMany({
            where: {
                TimeSection: { Trip: { tripId: tripId } }
            },
            select: {
                activityId: true,
                category: true
            }
        }))

        const categories = activities.reduce((t, e) => {
            t[e.activityId] = e.category;
            return t;
        }, {})

        const tripPictures = await prisma.tripPicture.findMany({
            where: { tripId: tripId },
            select: {
                activityId: true,
                pictureId: true,
                pictureUrl: true
            }
        })

        const result = { _trip: [] }
        for (const tripPicture of tripPictures) {
            if (!tripPicture.activityId) {
                result._trip.push({
                    pictureId: tripPicture.pictureId,
                    pictureUrl: tripPicture.pictureUrl
                })
            } else {
                const category = categories[tripPicture.activityId];
                if (!result[category]) result[category] = []
                result[category].push({
                    pictureId: tripPicture.pictureId,
                    pictureUrl: tripPicture.pictureUrl
                })
            }
        }

        return { result: result }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.tripActivityPictureService = {
    addTripPicture,
    deleteTripPicture,
    changeActivityTagsForTripPicture,
    getAllTripPictureAndFilterByActivity,
    getAllTripPictureAndFilterByCategory
}
