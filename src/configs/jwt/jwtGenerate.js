const jwt = require('jsonwebtoken');

const emailVerifyToken = email => {
	const token = jwt.sign(
		{ email: email },
		process.env.TOKEN_SECRET,
		{ expiresIn: 60 * 10 }
	);
	return token;
};

const loginToken = (accountData) => {
	const accessToken = jwt.sign(
		accountData,
		process.env.TOKEN_SECRET,
		{ expiresIn: 60 * 60 * 24 * 30 } // 1 hour
	);
	const refreshToken = jwt.sign(
		accountData,
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: 60 * 60 * 24 * 365 } // 1 year
	);
	return { accessToken, refreshToken };
};

module.exports = {
	emailVerifyToken,
	loginToken
};