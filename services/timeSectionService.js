const { PrismaClient } = require('@prisma/client');
const { v4: uuid } = require('uuid');

const prisma = new PrismaClient();
const errorHandler = (error) => {
    console.log(error);
    return { error: { message: error.message }, result: undefined }
}
const checkRole = async (email, tripId) => {
    try {
        const shareTrip = await prisma.sharedTrip.findUnique({
            where: {
                email_tripId: { email: email, tripId: tripId },
            },
            select: { role: true }
        })
        if (!shareTrip) return undefined;
        return shareTrip.role;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

const getAllTimeSectionFromTrip = async (email, tripId) => {
    try {
        await prisma.$connect();
        const role = await checkRole(email, tripId);
        if (!role) return { error: { message: 'Not a member or owner' } }

        const timeSections = await prisma.timeSection.findMany({
            where: { tripId: tripId }
        })

        return { result: timeSections }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

// const createTimeSection = async (email, timeSectionData) => {
//     try {
//         await prisma.$connect();
//         const role = await checkRole(email, timeSectionData.tripId);
//         if (role != 'owner') return { error: { message: 'Not owner' } }
//         const timeSection = await prisma.timeSection.create({
//             data: timeSectionData
//         })
//         return { result: timeSection }
//     } catch (error) {
//         return errorHandler(error);
//     } finally {
//         await prisma.$disconnect();
//     }
// }

const createTimeSections = async (email, tripId, timeSectionsData) => {
    try {
        await prisma.$connect();
        const role = await checkRole(email, tripId);
        if (role != 'owner') return { error: { message: 'Not owner' } }

        timeSectionsData.forEach(e => {
            e.tripId = tripId;
            e.timeSectionId = uuid();
        });
        await prisma.timeSection.createMany({
            data: timeSectionsData
        })
        return { result: timeSectionsData }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const updateTimeSection = async (email, timeSectionId, updateData) => {
    try {
        await prisma.$connect();
        const timeSection = await prisma.timeSection.update({
            where: {
                Trip: { owner: email },
                timeSectionId: timeSectionId
            },
            data: updateData
        })
        if (!timeSection) return { error: { message: "Not owner" } }

        return { result: timeSection }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const getTimeSectionById = async (email, timeSectionId) => {
    try {
        await prisma.$connect();
        const timeSection = await prisma.timeSection.findUnique({
            where: { timeSectionId: timeSectionId }
        })
        const tripId = timeSection.tripId;

        const role = await checkRole(email, tripId);
        if (!role) return { error: { message: "Not a member or owner" } }

        return { result: timeSection }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const deleteTimeSection = async (email, timeSectionId) => {
    try {
        await prisma.$connect();
        const timeSection = await prisma.timeSection.delete({
            where: {
                Trip: { owner: email },
                timeSectionId: timeSectionId
            }
        })
        if (!timeSection) return { error: { message: "Not owner" } }

        return { result: timeSection }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.timeSectionService = {
    getAllTimeSectionFromTrip,
    createTimeSections,
    updateTimeSection,
    getTimeSectionById,
    deleteTimeSection
}