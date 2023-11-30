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

const updateWishActivity = async (email, tripId, wishesDataUpdate) => {
    try {
        await prisma.$connect();
        const role = await checkRole(email, tripId);
        if (role != 'owner') return { error: { message: 'Not owner' } }

        const result = await Promise.all(
            wishesDataUpdate.map(wishDataUpdate => {
                prisma.wishActivity.update({
                    where: {
                        wishActivityId: wishDataUpdate.wishActivityId,
                        tripId: tripId
                    },
                    data: wishDataUpdate
                })
            })
        )
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

const pushWishActivityToTimeSection = async (email, timeSectionId, activitiesData) => {
    try {
        await prisma.$connect();
        // activitiesData = [{ wishActivityId: 1, order: 1}]
        const tripId = (await prisma.timeSection.findUnique({
            where: {
                timeSectionId: timeSectionId,
                Trip: { owner: email }
            },
            select: { Trip: true }
        })).Trip.tripId;

        const wishActivities = await Promise.all(
            activitiesData.map(activity => {
                return prisma.wishActivity.findUnique({
                    where: {
                        wishActivityId: activity.wishActivityId,
                        tripId: tripId
                    }
                })
            })
        )

        if (wishActivities.includes(null)) return { error: { message: 'Not in a same trip' } }
        const data = [];
        wishActivities.forEach((wishActivity, index) => {
            wishActivity.timeSectionId = timeSectionId;
            wishActivity.order = activitiesData[index].order;
            wishActivity.activityId = wishActivity.wishActivityId;
            delete wishActivity.wishActivityId;
            delete wishActivity.tripId;
            delete wishActivity.dateCreate;
            data.push(wishActivity);
        })

        await Promise.all([
            ...activitiesData.map(activityData => {
                return prisma.wishActivity.delete({
                    where: { wishActivityId: activityData.wishActivityId }
                })
            }),
            prisma.activity.createMany({
                data: data
            })
        ])

        const workerData = {
            action: 'addActivities',
            data: {
                tripId: wishActivityData.tripId,
                activitiesData: data
            }
        };
        new Worker(
            `${global.__path_background_workers}/resetTripActualBudget.js`,
            { workerData: workerData }
        )

        return { result: data }
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