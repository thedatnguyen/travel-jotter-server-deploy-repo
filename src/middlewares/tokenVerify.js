const { PrismaClient } = require('@prisma/client');

const { tokenValidate, tokenGenerate } = require('../utils/jwt');
const { getCookies } = require('../utils/helper');

const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
	try {
		/* get cookies */
		const cookies = getCookies(req);
		const accessToken = cookies['access-token'] || req.headers['access-token'];
		const refreshToken = cookies['refresh-token'] || req.headers['refresh-token'];
		if(!accessToken || !refreshToken) return res.status(403).send({error: {message: 'Missing token(s)'}});

		const {error, decoded: account} = tokenValidate(accessToken, process.env.TOKEN_SECRET);

		/* access token valid */
		if(!error){
			res.locals = {
				account,
				tokens: {
					access_token: accessToken,
					refresh_token: refreshToken
				}
			}
			return next();
		}

		/* access token not validated, check refresh token */
		const { decoded } = tokenValidate(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		/* get refreshToken stored in DB */
		const refreshTokenStoraged = await prisma.refreshToken.findUnique({
			where: {sid: cookies['connect.sid']}
		})

		if(!refreshTokenStoraged) return res.status(403).send({ error: { message: 'Unrecognized session'}});

		//* sid and refreshToken found in DB, and refreshToken in cookies is valid *//
		if(refreshTokenStoraged.refreshToken == refreshToken && decoded){
			delete decoded.iat;
			delete decoded.exp;
			const expInMillisecond = refreshTokenStoraged.loginAt + 1000 * 60 * 60 * 24 * 365 - Date.now();
			const newRefreshToken = tokenGenerate(decoded, process.env.REFRESH_TOKEN_SECRET, Math.floor(expInMillisecond / 1000));
			const newAccessToken = tokenGenerate(decoded, process.env.TOKEN_SECRET, 60 * 10);

			/* update new refreshToken */
			await prisma.refreshToken.update({
				where: {sid: cookies['connect.sid']},
				data: {refreshToken: newRefreshToken}
			})
			
			res.locals = {
				account: decoded,
				tokens: {
					access_token: newAccessToken,
					refresh_token: newRefreshToken
				}
			}
			return next();
		}

		/* refreshToken invalid due to wrong token, login session ended, ... */
		if(refreshTokenStoraged) await prisma.refreshToken.delete({
			where: {sid: cookies['connect.sid']}
		})

		return res.status(403).send({ error: { message: 'Unthorized'}});
	} catch (error) {
		console.log(error);
		res.status(500).send({error: { message: error.message }});
	} finally {
		await prisma.$disconnect();
	}
};
