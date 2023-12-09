const jwt = require('jsonwebtoken');

const tokenValidate = (token, secretKey) => {
	let r = {};
	jwt.verify(token, secretKey, (error, decoded) => {
		r.error = error;
		r.decoded = decoded;
	});
	return r;
};

module.exports = { tokenValidate };