const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const dropbox = require('../configs/dropbox');
const weavy = require('../configs/weavy');

const prisma = new PrismaClient();
const errorHandler = (error) => {
	console.log(error);
	return { error: { message: error.message }, result: undefined };
};

const getAllAccounts = async () => {
	try {
		await prisma.$connect();
		const result = await prisma.account.findMany({
			select: {
				email: true,
				username: true,
				pictureUrl: true
			}
		});
		return { result };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const changeAvatarPicture = async (pictureId, pictureUrl, picture, chatAccountId) => {
	try {
		await prisma.$connect();
		const pictureBuffer = Buffer.from(picture, 'base64');
		await dropbox.updateImage(pictureId, pictureBuffer);
		await weavy.changeChatAvatar(chatAccountId, pictureUrl);
		return {};
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const updateInformation = async (email, newData) => {
	try {
		await prisma.$connect();
		const account = await prisma.account.update({
			where: { email: email },
			data: newData
		});
		return { result: account };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const changePassword = async (email, oldPassword, newPassword) => {
	try {
		await prisma.$connect();
		const account = await prisma.account.findUnique({
			where: { email: email }
		});

		// do not have password yet
		if (account.hashedPassword) {
			const check = await bcrypt.compare(oldPassword, account.hashedPassword);
			// old password mismatch
			if (!check) return { error: { message: 'Password mismatch' } };
		}

		const newHashedPassword = await bcrypt.hash(newPassword, Math.floor(Math.random() * 16));
		await prisma.account.update({
			where: { email: email },
			data: { hashedPassword: newHashedPassword }
		});
		return {};
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const changePasswordWithoutOldPassword = async (email, newPassword) => {
	try {
		await prisma.$connect();
		const newHashedPassword = await bcrypt.hash(newPassword, Math.floor(Math.random() * 16));
		await prisma.account.update({
			where: { email: email },
			data: { hashedPassword: newHashedPassword }
		});
		return {};
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

module.exports.profileService = {
	getAllAccounts,
	changeAvatarPicture,
	updateInformation,
	changePassword,
	changePasswordWithoutOldPassword
};