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
	return { 
		accessToken: tokenGenerate(accountData, process.env.TOKEN_SECRET, 60 * 10), // expires in 10 mins
		refreshToken: tokenGenerate(accountData, process.env.REFRESH_TOKEN_SECRET, 60 * 60 * 24 * 365)
	}
};

const tokenGenerate = (payload, secretKey, exp) => {
	const token = jwt.sign(
		payload,
		secretKey,
		{ expiresIn: exp }
	)
	return token;
};

const tokenValidate = (token, secretKey) => {
	const result = {
		error: undefined,
		decoded: undefined
	};
	jwt.verify(token, secretKey, (error, decoded) => {
		result.error = error,
		result.decoded = decoded
	});
	return result;
};

module.exports = {
	emailVerifyToken,
	loginToken,
	tokenGenerate,
	tokenValidate
};