const { PrismaClient } = require('@prisma/client');
const { Worker, workerData } = require('worker_threads');
const { v4: uuid } = require('uuid');

const prisma = new PrismaClient();
const errorHandler = (error) => {
    console.log(error);
    return { error: { message: error.message } }
}

const getTripIdFromTimeSectionId = async (timeSectionId) => {
    try {
        const tripId = (await prisma.timeSection.findUnique({
            where: { timeSectionId: timeSectionId },
            select: { tripId: true }
        })).tripId;
        return tripId;
    } catch (error) {
        return undefined;
    }
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

// get all activities in a time section
const getActivities = async (email, timeSectionId) => {
    try {
        await prisma.$connect();
        const tripId = await getTripIdFromTimeSectionId(timeSectionId);
        const role = await checkRole(email, tripId);
        if (!role) return {
            error: { message: 'not owner or member' }
        }

        const activities = await prisma.activity.findMany({
            where: { timeSectionId: timeSectionId }
        })

        return { result: activities }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

// create activities in a time section
const createActivites = async (email, timeSectionId, activitiesData) => {
    try {
        await prisma.$connect();
        const tripId = await getTripIdFromTimeSectionId(timeSectionId);
        const role = await checkRole(email, tripId);
        if (role != 'owner') return { error: { message: 'not owner' } }

        activitiesData.forEach(activityData => {
            activityData.activityId = uuid();
            activityData.timeSectionId = timeSectionId;
        });
        await prisma.activity.createMany({
            data: activitiesData
        })

        const result = await Promise.all(
            activitiesData.map(activityData => prisma.activity.findUnique({
                where: { activityId: activityData.activityId }
            }))
        )

        const workerData = {
            action: 'addActivities',
            data: {
                tripId: tripId,
                activitiesData: activitiesData
            }
        };
        new Worker(
            `${global.__path_background_workers}/resetTripActualBudget.js`,
            { workerData: workerData }
        )

        return { result: result }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

// update activities in a time section
const updateActivities = async (email, timeSectionId, activitiesUpdateData) => {
    try {
        await prisma.$connect();
        const tripId = await getTripIdFromTimeSectionId(timeSectionId);
        const role = await checkRole(email, tripId);
        if (role != 'owner') return { error: { message: 'not owner' } }

        const activities = await Promise.all(
            activitiesUpdateData.map(data => {
                return prisma.activity.update({
                    where: {
                        activityId: data.activityId,
                        timeSectionId: timeSectionId
                    },
                    data: data
                })
            })
        )

        const workerData = {
            action: 'updateActivities',
            data: { tripId: tripId }
        };
        new Worker(
            `${global.__path_background_workers}/resetTripActualBudget.js`,
            { workerData: workerData }
        )

        return { result: activities }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const deleteActivityById = async (email, activityId) => {
    try {
        await prisma.$connect();

        const activity = await prisma.activity.findUnique({
            where: { activityId: activityId },
            select: {
                TimeSection: true,
                budget: true
            }
        })
        const tripId = activity.TimeSection.tripId;
        const deleteBudget = activity.budget;
        const role = await checkRole(email, tripId);
        if (role != 'owner') return { error: { message: 'not owner' } }

        await prisma.activity.delete({
            where: { activityId: activityId }
        })

        const workerData = {
            action: 'deleteActivities',
            data: {
                tripId: tripId,
                deleteBudget: deleteBudget
            }
        };
        new Worker(
            `${global.__path_background_workers}/resetTripActualBudget.js`,
            { workerData: workerData }
        )

        return { result: activityId }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const moveActivityToWishList = async (email, activityId) => {
    try {
        await prisma.$connect();

        const activity = await prisma.activity.findUnique({
            where: {
                activityId: activityId,
                TimeSection: { Trip: { owner: email } }
            },
            select: {
                TimeSection: true,
                activityId: true,
                title: true,
                note: true,
                budget: true,
                location: true,
                category: true
            }
        })

        activity.tripId = activity.TimeSection.tripId;
        activity.wishActivityId = activity.activityId;
        delete activity.TimeSection;
        delete activity.activityId;

        await Promise.all([
            prisma.activity.delete({
                where: { activityId: activityId }
            }),
            prisma.wishActivity.create({
                data: activity
            })
        ])

        const workerData = {
            action: 'deleteActivities',
            data: {
                tripId: activity.tripId,
                deleteBudget: activity.budget
            }
        };
        new Worker(
            `${global.__path_background_workers}/resetTripActualBudget.js`,
            { workerData: workerData }
        )

        return { result: activityId }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.activityService = {
    getActivities,
    createActivites,
    updateActivities,
    deleteActivityById,
    moveActivityToWishList
}
