const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const { loginToken } = require('../configs/jwt/jwtGenerate');
const weavy = require('../configs/weavy');
const dropbox = require('../configs/dropbox');

const prisma = new PrismaClient();
const errorHandler = (error) => {
	console.log(error);
	return { error: { message: error.message } };
};

const checkEmailDuplicate = async (email) => {
	try {
		await prisma.$connect();
		const account = await prisma.account.findUnique({
			where: { email: email }
		});
		if (account) return true;
		return false;
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const pendingAccount = async (accountData) => {
	try {
		await prisma.$connect();
		accountData.hashedPassword = await bcrypt.hash(accountData.password, Math.floor(Math.random() * 16));
		delete accountData.password;

		// check if account already existed
		const account = await prisma.account.findUnique({
			where: { email: accountData.email }
		});
		if (account) return { error: { message: 'Account in used' } };

		// account valid, add to pending table
		const pendingAccount = await prisma.pendingAccount.findUnique({
			where: { email: accountData.email }
		});
		if (pendingAccount) return { result: pendingAccount };

		const pendingAccountCreate = await prisma.pendingAccount.create({
			data: accountData
		});
		return { result: pendingAccountCreate };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const createNewAccount = async (email) => {
	try {
		await prisma.$connect();
		const pendingAccount = await prisma.pendingAccount.findUnique({
			where: { email: email }
		});

		// set default avatar
		const pictureBuffer = fs.readFileSync(global.__path_default_avatar);
		const { pictureId, pictureUrl } = await dropbox.uploadImage(pictureBuffer);
		pendingAccount.pictureId = pictureId;
		pendingAccount.pictureUrl = pictureUrl;

		// provide chat account id for new user
		pendingAccount.chatAccountId = await weavy.createUser(pendingAccount);

		// delete pending and add new account
		delete pendingAccount.index;
		await Promise.all([
			prisma.account.create({
				data: pendingAccount
			}),
			prisma.pendingAccount.delete({
				where: { email: pendingAccount.email }
			})
		]);
		return { result: pendingAccount };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const loginWithPassword = async (email, password) => {
	try {
		await prisma.$connect();
		const account = await prisma.account.findUnique({
			where: { email: email }
		});
		if (!account) return { error: { message: 'Account not found' } };


		if (! await bcrypt.compare(password, account.hashedPassword))
			return { error: { message: 'Password not valid' } };

		delete account.hashedPassword;

		const { accessToken, refreshToken } = loginToken(account);
		const refreshTokenData = {
			email: email,
			refreshToken: refreshToken,
			iat: new Date().getTime()
		};
		await prisma.refreshToken.upsert({
			where: { email: email },
			update: refreshTokenData,
			create: refreshTokenData
		});

		return {
			result: {
				account: account,
				accessToken,
				refreshToken
			}
		};
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const loginWithGmail = async (email) => {
	try {
		await prisma.$connect();
		const account = await prisma.account.findUnique({
			where: { email: email }
		});

		delete account.hashedPassword;

		const { accessToken, refreshToken } = loginToken(account);
		const refreshTokenData = {
			email: email,
			refreshToken: refreshToken,
			iat: new Date().getTime()
		};
		await prisma.refreshToken.upsert({
			where: { email: email },
			update: refreshTokenData,
			create: refreshTokenData
		});

		return {
			result: {
				account: account,
				accessToken,
				refreshToken
			}
		};
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const logout = async (email) => {
	try {
		await prisma.$connect();
		const result = await prisma.refreshToken.delete({
			where: { email: email }
		});
		return { result: result };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

module.exports.authService = {
	checkEmailDuplicate,
	pendingAccount,
	createNewAccount,
	loginWithPassword,
	loginWithGmail,
	logout
};
