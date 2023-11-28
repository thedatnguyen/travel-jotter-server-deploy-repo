const { sendMail } = require("../configs/nodemailer/sendMail");
const { emailVerifyToken } = require("../configs/jwt/jwtGenerate");
const { tokenValidate } = require('../configs/jwt/jwtValidate');
const { authService } = require('../services/authService');

const errorHandler = (response, error, code) => {
    console.log(error);
    return response.status(code).send({ message: error.message })
}

const checkEmailDuplicate = async (req, res) => {
    try {
        const { email } = req.query;
        const isDuplicate = await authService.checkEmailDuplicate(email)
        if (isDuplicate) return res.status(400).send({ message: 'Duplicate email' });
        return res.status(200).send({ message: 'email valid' });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const signUp = async (req, res, next) => {
    try {
        const newAccount = req.body;

        // check account and save pending if valid
        const { error } = await authService.pendingAccount(newAccount);
        if (error) return errorHandler(res, error, 400);

        //send verification email
        const token = emailVerifyToken(newAccount.email);
        await sendMail(
            newAccount.email,
            "Travel Jotter verification email",
            `Hello, please click on the link below to verify your account: ${process.env.SERVER}/auth/verifyEmail/${token}. Exprires in 10 minutes`
        )
            .then(() => res.status(200).send('Email sent'));
    } catch (error) {
        return errorHandler(res, error, 500);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { error, decoded } = tokenValidate(token, process.env.TOKEN_SECRET);
        if (error) return res.status(400).send('Token validation failed');

        // email verified
        const { email } = decoded;
        const {error: err} = await authService.createNewAccount(email);
        if (err) return errorHandler(res, err, 500);
        return res.redirect(`${process.env.FE_SERVER}/login`)
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const loginWithPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { error, result } = await authService.loginWithPassword(email, password);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result: result.account,
            tokens: {
                access_token: result.accessToken,
                refresh_token: result.refreshToken,
            }
        });
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const redirectAndSendGrantCode = async (req, res) => {
    try {
        const { email } = req.user;
        const grant_code = emailVerifyToken(email, process.env.TOKEN_SECRET);
        return res.redirect(`${process.env.FE_SERVER}/login?grant_code=${grant_code}`)
    } catch (error) {
        return res.redirect(`${process.env.FE_SERVER}/login?error=${error.message}`);
    }
}

const loginWithGmail = async (req, res, next) => {
    try {
        const { grant_code } = req.query;
        const grantCodeValidate = tokenValidate(grant_code, process.env.TOKEN_SECRET);
        if (grantCodeValidate.error)
            return res.status(400).send({ message: grantCodeValidate.error.message });
        const email = grantCodeValidate.decoded.email;
        const { error, result } = await authService.loginWithGmail(email);
        if (error) return errorHandler(res, error, 400);
        return res.status(200).send({
            result: result,
            tokens: {
                access_token: result.accessToken,
                refresh_token: result.refreshToken
            }
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const logout = async (req, res, next) => {
    try {
        const { account } = res.locals;
        const email = account.email;
        const { error } = await authService.logout(email);
        if (error) return errorHandler(res, error, 400);
        return res.status(204).send();
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

module.exports = {
    checkEmailDuplicate,
    signUp,
    verifyEmail,
    loginWithPassword,
    redirectAndSendGrantCode,
    loginWithGmail,
    logout
};
