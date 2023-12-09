const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const errorHandler = (err) => {
	console.log(err);
	return { error: { message: err.message }, result: undefined };
};

const getAllNoti = async (email) => {
	try {
		await prisma.$connect();
		const result = await prisma.notification.findMany({
			where: { owner: email },
			orderBy: { createAt: 'desc' },
			select: {
				title: true,
				content: true,
				createAt: true,
			}
		});
		return { result };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const removeNoti = async(email, notificationId) => {
	try {
		await prisma.$connect();
		const result = await prisma.notification.delete({
			where: {
				owner: email,
				notificationId: notificationId
			}
		});
		return { result };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

module.exports.notificationService = {
	getAllNoti,
	removeNoti
};