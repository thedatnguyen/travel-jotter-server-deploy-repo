const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const errorHandler = (err) => {
    console.log(err)
    return { error: { message: err.message } }
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
        return undefined;
    }
}

const getCommentsInActivity = async (email, activityId) => {
    try {
        await prisma.$connect();
        const tripId = (await prisma.activity.findUnique({
            where: { activityId: activityId },
            select: { TimeSection: true }
        })).TimeSection.tripId
        const role = await checkRole(email, tripId);
        if (!role) return { error: { message: 'Not owner or member' } }

        const comments = await prisma.comment.findMany({
            where: { activityId: activityId }
        });
        return {
            result: comments
        }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const createComment = async (email, commentData) => {
    try {
        await prisma.$connect();
        const activityId = commentData.activityId;
        const tripId = (await prisma.activity.findUnique({
            where: { activityId: activityId },
            select: { TimeSection: true }
        })).TimeSection.tripId;
        const role = await checkRole(email, tripId);
        if (!role) return { error: { message: 'Not owner or member' } }

        commentData.author = email
        const comment = await prisma.comment.create({
            data: commentData
        });
        return { result: comment }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const editComment = async (email, commentUpdateData) => {
    try {
        await prisma.$connect();
        const { author } = await prisma.comment.findUnique({
            where: { commentId: commentUpdateData.commentId },
            select: { author: true }
        });

        if (author != email) return { error: { message: 'Not comment author' } }

        const comment = await prisma.comment.update({
            where: { commentId: commentUpdateData.commentId },
            data: commentUpdateData
        })
        return { result: comment }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

const deleteComment = async (email, commentId) => {
    try {
        await prisma.$connect();
        const { author, activityId } = await prisma.comment.findUnique({
            where: { commentId: commentId },
            select: { author: true, activityId: true }
        });
        const tripId = (await prisma.activity.findUnique({
            where: { activityId: activityId },
            select: { TimeSection: true }
        })).TimeSection.tripId;
        const tripRole = await checkRole(email, tripId);
        if (author != email && tripRole != 'author')
            return { error: { message: 'Not comment author or trip owner' } }

        const deleteComment = await prisma.comment.delete({
            where: { commentId: commentId }
        })
        return { result: deleteComment }
    } catch (error) {
        return errorHandler(error);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.commentService = {
    getCommentsInActivity,
    createComment,
    editComment,
    deleteComment
}