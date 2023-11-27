const nodemailer = require('nodemailer');

const sendMail = async (receiver, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.USERNAME,
            pass: 'pfuotlixmzrcbmta'
        }
    })
    await transporter.sendMail({
        from: process.env.USER,
        to: receiver,
        subject: subject,
        text: message
    })
}

module.exports = { sendMail }