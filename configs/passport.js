var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const weavy = require('./weavy');
const dropbox = require('./dropbox');
const prisma = new PrismaClient();

passport.serializeUser(function (user, cb) {
    try {
        cb(null, user);
        console.log(`serialize success`);
    } catch (error) {
        console.log(`serialize failed`);
        console.log(error);
    }
});

passport.deserializeUser(function (obj, cb) {
    try {
        cb(null, obj);
        console.log(`deserialize success`);
    } catch (error) {
        console.log(`deserialize failed`);
        console.log(error);
    }
    
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

                const newAccountData = await prisma.account.create({
                    data: newAccount
                })

                console.log(newAccountData)
            }

            done(null, profile);
        } catch (error) {
            console.log(error);
            done(error);
        }
    }
));

module.exports = { passport }