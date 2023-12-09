const { profileService } = require('../services/profileService');
const { sendMail } = require('../configs/nodemailer/sendMail');
const val = require('../validators/profileRequest');

const errorHandler = (response, error, code) => {
	console.log(error);
	return response.status(code).send({
		message: error.message,
		tokens: response.locals.tokens
	});
};

const getAllAccounts = async (req, res) => {
	try {
		const { error, result } = await profileService.getAllAccounts();
		if (error) return errorHandler(res, error, 400);
		return res.status(200).send({
			result,
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};
const updateAvatar = async (req, res) => {
	try {
		const { error: err } = val.updateAvatarReqValidate(req.body);
		if (err) return errorHandler(res, err.details[0], 422);

		const { chatAccountId, pictureId, pictureUrl } = res.locals.account;
		const { picture } = req.body;
		const { error } = await profileService.changeAvatarPicture(pictureId, pictureUrl, picture, chatAccountId);
		if (error) return errorHandler(res, error, 400);
		return res.status(200).send({
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const updateInformation = async (req, res) => {
	try {
		const { error: err } = val.updateInformationReqValidate(req.body);
		if (err) return errorHandler(res, err.details[0], 422);

		const { email } = res.locals.account;
		const newData = req.body;
		const { error } = await profileService.updateInformation(email, newData);
		if (error) return errorHandler(res, error, 400);
		return res.status(200).send({
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const changePassword = async (req, res) => {
	try {
		const { error: err } = val.changePasswordReqValidate(req.body);
		if (err) return errorHandler(res, err.details[0], 422);

		const { email } = res.locals.account;
		const { newPassword, oldPassword } = req.body;
		const { error } = await profileService.changePassword(email, oldPassword, newPassword);
		if (error) return errorHandler(res, error, 400);
		return res.status(200).send({
			tokens: res.locals.tokens
		});
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const sendEmailResetPassword = async (req, res) => {
	try {
		const { email, redirectUri } = req.query;
		await sendMail(
			email,
			'Travel Jotter reset password email',
			`Please click on the link below to reset your password: ${redirectUri}`
		);
		res.status(204).send();
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

const resetPasswordFromEmail = async (req, res) => {
	try {
		const { email, newPassword } = req.body;
		const { error } = await profileService.changePasswordWithoutOldPassword(email, newPassword);
		if (error) return errorHandler(res, error, 400);
		res.status(204).send();
	} catch (error) {
		return errorHandler(res, error, 500);
	}
};

module.exports = {
	getAllAccounts,
	updateAvatar,
	updateInformation,
	changePassword,
	sendEmailResetPassword,
	resetPasswordFromEmail
};