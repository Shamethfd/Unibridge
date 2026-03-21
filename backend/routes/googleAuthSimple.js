import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple Google OAuth redirect (for testing)
router.get('/google', (req, res) => {
  // For now, create a mock Google user for testing
  // In production, this would redirect to actual Google OAuth
  
  const mockGoogleUser = {
    _id: 'google_user_' + Date.now(),
    email: 'testuser@gmail.com',
    role: 'student',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      avatar: 'https://via.placeholder.com/100'
    }
  };

  // Generate JWT token
  const token = jwt.sign(
    { userId: mockGoogleUser._id, role: mockGoogleUser.role },
    process.env.JWT_SECRET || 'learnbridge_super_secret_key_123456789',
    { expiresIn: '7d' }
  );

  // Redirect to frontend with token and user info
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(mockGoogleUser))}`;

  res.redirect(redirectUrl);
});

export default router;
