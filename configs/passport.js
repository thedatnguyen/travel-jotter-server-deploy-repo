var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const weavy = require('./weavy');
const dropbox = require('./dropbox');
const prisma = new PrismaClient();

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const googleAccount = profile._json;

            const account = await prisma.account.findUnique({
                where: { email: googleAccount.email }
            })
            console.log(account);

            // account not registered yet: first login -> create new account
            if (!account) {
                console.log('create new account')
                const googlePicture = (await axios.get(googleAccount.picture, { responseType: 'arraybuffer' })).data;
                const pictureBuffer = Buffer.from(googlePicture, 'base64');
                const { pictureUrl, pictureId } = await dropbox.uploadImage(pictureBuffer);
                const newAccount = {
                    email: googleAccount.email,
                    username: googleAccount.email,
                    gender: 'not_defined',
                    firstName: googleAccount.given_name,
                    lastName: googleAccount.family_name,
                    hashedPassword: '',
                    pictureUrl,
                    pictureId,
                    phoneNumber: '',
                }

                newAccount.chatAccountId = await weavy.createUser(newAccount)

                await prisma.account.create({
                    data: newAccount
                })
            }
        } catch (error) {
            console.log(error);
        } finally {
            return done(null, profile);
        }
    }
));

module.exports = { passport }