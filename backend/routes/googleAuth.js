import express from 'express';
import passport from '../config/googleAuth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Check if Google OAuth is configured
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('⚠️  Google OAuth not configured - routes disabled');
  
  // Return a placeholder route that informs the user
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please contact the administrator.',
      details: 'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables'
    });
  });
  
  router.get('/google/callback', (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_not_configured`);
  });
} else {
  // Google OAuth login route
  router.get('/google', passport.authenticate('google', { session: false }));

  // Google OAuth callback route
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      try {
        // Generate JWT token
        const token = jwt.sign(
          { userId: req.user._id, role: req.user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token and user info
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
          _id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          profile: req.user.profile
        }))}`;

        res.redirect(redirectUrl);
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
    }
  );
}

export default router;
