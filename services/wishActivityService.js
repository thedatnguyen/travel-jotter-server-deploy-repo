const { PrismaClient } = require('@prisma/client');
const { Worker, workerData } = require('worker_threads');

const prisma = new PrismaClient();

const errorHandler = (error) => {
    console.log(error);
    return { error: { message: error.message }, result: undefined };
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

const getAllWishActivityFromTrip = async (email, tripId) => {
    try {
        await prisma.$connect();
        const role = await checkRole(email, tripId);
        if (!role) return { error: { message: 'Not owner or member' } }

        const result = await prisma.wishActivity.findMany({
            where: { tripId: tripId }
        })
        return { result }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const createWishActivity = async (email, wishActivityData) => {
    try {
        await prisma.$connect();
        const role = await checkRole(email, wishActivityData.tripId);
        if (role != 'owner') return { error: { message: 'Not owner' } }

        const result = await prisma.wishActivity.create({
            data: wishActivityData
        })

        return { result: result }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const updateWishActivity = async (email, wishActivityId, updateData) => {
    try {
        await prisma.$connect();
        const result = await prisma.wishActivity.update({
            where: {
                wishActivityId: wishActivityId,
                Trip: { owner: email }
            },
            data: updateData
        })
        return { result }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const deleteWishActivity = async (email, wishActivityId) => {
    try {
        await prisma.$connect();
        const result = await prisma.wishActivity.delete({
            where: {
                wishActivityId: wishActivityId,
                Trip: { owner: email }
            }
        })
        return { result }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const pushWishActivityToTimeSection = async (email, timeSectionId, wishActivityId, order) => {
    try {
        await prisma.$connect();
        const check = await Promise.all([
            prisma.timeSection.findUnique({
                where: {
                    timeSectionId: timeSectionId,
                    Trip: { owner: email }
                },
                select: { tripId: true }
            }),
            prisma.wishActivity.findUnique({
                where: { wishActivityId: wishActivityId },
            })
        ])

        if (check[0].tripId != check[1].tripId)
            return { error: { message: 'Not in a same trip' } }

        const wishActivityData = check[1]
        wishActivityData.activityId = wishActivityId;

        delete wishActivityData.wishActivityId;
        delete wishActivityData.tripId;
        delete wishActivityData.dateCreate;
        wishActivityData.timeSectionId = timeSectionId;
        wishActivityData.order = order;

        const result = await Promise.all([
            prisma.activity.create({
                data: wishActivityData
            }),
            prisma.wishActivity.delete({
                where: { wishActivityId: wishActivityId }
            })
        ])

        const workerData = {
            action: 'addActivities',
            data: {
                tripId: wishActivityData.tripId,
                activitiesData: [wishActivityData]
            }
        };
        new Worker(
            `${global.__path_background_workers}/resetTripActualBudget.js`,
            { workerData: workerData }
        )

        return { result: result[0] }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.wishActivityService = {
    getAllWishActivityFromTrip,
    createWishActivity,
    updateWishActivity,
    deleteWishActivity,
    pushWishActivityToTimeSection
}