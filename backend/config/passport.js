import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://digital-library-backend-clf5.onrender.com/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 Google OAuth Profile:', {
      id: profile.id,
      email: profile.emails[0]?.value,
      name: profile.displayName,
      picture: profile.photos[0]?.value
    });

    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = profile.id;
        user.profilePic = profile.photos[0]?.value || user.profilePic;
        await user.save();
      }
      console.log('✅ Existing user logged in via Google:', user.email);
    } else {
      // Create new user
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        profilePic: profile.photos[0]?.value || 'defaultPic.jpg',
        isEmailVerified: true, // Google emails are verified
        emailVerifiedAt: new Date(),
        role: 'user',
        // Generate a random password for Google users
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });
      
      await user.save();
      console.log('✅ New user created via Google:', user.email);
    }

    return done(null, user);
  } catch (error) {
    console.error('❌ Google OAuth Error:', error);
    return done(error, null);
  }
}));

export default passport;
