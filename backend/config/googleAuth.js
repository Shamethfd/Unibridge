import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Debug: Check environment variables at the time of import
console.log('🔍 Google Auth Config Debug:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_ID value:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');

// Check if Google OAuth credentials are configured
const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (!isGoogleConfigured) {
  console.error('❌ Google OAuth credentials not found in environment variables');
  console.error('Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file');
  console.error('See .env.example for configuration details');
  console.log('⚠️  Google OAuth will be disabled until credentials are provided');
} else {
  console.log('✅ Google OAuth credentials found, setting up strategy...');
  // Google OAuth is configured, set up the strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          } else {
            // Create new user
            const newUser = await User.create({
              email: profile.emails[0].value,
              profile: {
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                avatar: profile.photos[0].value,
              },
              role: 'student', // Default role for Google users
              isEmailVerified: true,
              lastLogin: new Date(),
              createdAt: new Date(),
            });

            return done(null, newUser);
          }
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  console.log('✅ Google OAuth strategy configured successfully');
}

export default passport;
