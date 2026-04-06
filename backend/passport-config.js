const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./auth/auth.dao');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/api/oauth2callback",
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ]
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
                user = new User({
                    email: profile.emails[0].value,
                    nombre: profile.displayName,
                    googleId: profile.id,
                    googleAccessToken: accessToken,
                    googleRefreshToken: refreshToken
                });
                await user.save();
            } else {
                user.googleAccessToken = accessToken;
                user.googleRefreshToken = refreshToken;
                await user.save();
            }

            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });
            user.token = token;
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};