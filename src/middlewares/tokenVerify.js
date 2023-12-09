const { PrismaClient } = require('@prisma/client');

const { tokenValidate, loginToken } = require('../utils/jwt');

const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
	try {

		if (!req.headers['access-token'] || !req.headers['refresh-token']) {
			return res.status(403).send({error: {message: 'Missing token'}});
		}

		let accessTokenValidate = tokenValidate(req.headers['access-token'], process.env.TOKEN_SECRET);
		// access token valid
		if (!accessTokenValidate.error) {
			res.locals = {
				account: accessTokenValidate.decoded,
				tokens: {
					access_token: req.headers['access-token'],
					refresh_token: req.headers['refresh-token']
				}
			};
			return next();
		}

		//* access token invalid, check refresh token *//
		const { error, decoded } = tokenValidate(req.headers['refresh-token'], process.env.REFRESH_TOKEN_SECRET);

		// refresh token invalid
		if (error) return res.status(403).send({ message: error.message });
		const accountData = decoded;

		// check refresh token store in DB
		const refreshToken = await prisma.refreshToken.findUnique({
			where: {
				email: accountData.email,
				refreshToken: req.headers['refresh-token']
			},
		});

		// refresh token not found in DB
		if (!refreshToken) return res.status(403).send({error: { message: 'Unauthorized' }});

		// refresh token expired due to logiin session ended
		if (BigInt(new Date().getTime()) - refreshToken.iat > 1000 * 60 * 60 * 24 * 365) {
			await prisma.refreshToken.delete({
				where: { email: accountData.email }
			});
			return res.status(401).send({error: { message: 'Login session end' }});
		}

		// authorize success, update refresh token
		delete accountData.exp;
		delete accountData.iat;
		const tokens = loginToken(accountData);
		await prisma.refreshToken.update({
			where: { email: accountData.email },
			data: { refreshToken: tokens.refreshToken }
		});
		res.locals = {
			account: accountData,
			tokens: {
				access_token: tokens.accessToken,
				refresh_token: tokens.refreshToken
			}
		};
		next();
	} catch (error) {
		console.log(error);
		res.status(500).send({error: { message: error.message }});
	} finally {
		await prisma.$disconnect();
	}
};
