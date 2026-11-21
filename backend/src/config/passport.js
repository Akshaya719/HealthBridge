const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
const googleAuthConfigured = Boolean(googleClientId && googleClientSecret && googleCallbackUrl);

if (googleAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            user.authProvider = "google";
            if (!user.profilePicture) user.profilePicture = profile.photos[0].value;
            await user.save();
            return done(null, user);
          }

          user = new User({
            userName: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            profilePicture: profile.photos[0].value,
            authProvider: "google",
            isEmailVerified: true
          });

          await user.save();
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
}

passport.isGoogleAuthConfigured = googleAuthConfigured;

// Serialize user for session (or token generation reference)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
