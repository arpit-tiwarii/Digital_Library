import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Google OAuth login route
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth/google/failure',
    session: false 
  }), 
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id, 
          username: user.name, 
          role: user.role
        }, 
        process.env.JWT_SECRET || 'default_jwt_secret_key',
        { expiresIn: '365d' }
      );

      // Send welcome email for new users (optional)
      if (user.createdAt && user.createdAt > new Date(Date.now() - 60000)) { // User created in last minute
        try {
          await sendWelcomeEmail(user.email, user.name);
          console.log(`✅ Welcome email sent to new Google user: ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send welcome email to ${user.email}:`, emailError);
        }
      }

      // Redirect to frontend with token - ensure proper cross-port redirect
      const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || null,
        isEmailVerified: user.isEmailVerified
      };
      
      const finalUrl = `${redirectUrl}/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      console.log('🔗 Redirecting to:', finalUrl);
      console.log('📍 Frontend URL from env:', process.env.FRONTEND_URL);
      console.log('📍 Default fallback URL:', 'http://localhost:5174');
      
      // Use 302 redirect for better compatibility
      res.status(302).redirect(finalUrl);

    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      res.redirect(`${redirectUrl}/auth-failure?error=oauth_callback_failed`);
    }
  }
);

// Google OAuth failure route
router.get('/google/failure', (req, res) => {
  const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  console.log('❌ Google OAuth failed, redirecting to:', `${redirectUrl}/auth-failure`);
  res.redirect(`${redirectUrl}/auth-failure?error=google_auth_failed`);
});

// Get current user info (for checking if user is authenticated)
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePic: req.user.profilePic || null,
        isEmailVerified: req.user.isEmailVerified
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${redirectUrl}/logout-success`);
  });
});

export default router;
