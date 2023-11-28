var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const weavy = require('./weavy');
const dropbox = require('./dropbox');
const prisma = new PrismaClient();

passport.serializeUser((loginAccount, done) => {
    try {
        done(null, loginAccount);
        console.log(`serialize success`);
    } catch (error) {
        console.log(`serialize failed`);
        console.log(error);
    }
});

passport.deserializeUser((loginAccount, done) => {
    try {
        done(null, loginAccount);
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
        const googleAccount = profile._json;
        let loginAccount = {}
        try {
            const account = await prisma.account.findUnique({
                where: { email: googleAccount.email }
            })

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

                loginAccount = await prisma.account.create({
                    data: newAccount
                })
            } else {
                loginAccount = account;
            }
            
            done(null, loginAccount);
        } catch (error) {
            console.log(error);
            done(error, false, error.message)
        }
    }
));

module.exports = { passport }