import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Admin middleware - check if user has admin role
export const adminOnly = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tokenUserId = decoded.id || decoded.userId;

    // Legacy support for old hardcoded admin tokens
    if (tokenUserId === 'admin-hardcoded') {
      req.user = {
        _id: 'admin-hardcoded',
        email: 'admin@learnbridge.com',
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator'
        }
      };
      return next();
    }

    if (!tokenUserId || !mongoose.Types.ObjectId.isValid(tokenUserId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    const user = await User.findById(tokenUserId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.user = user;
    return next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Server error in admin authentication.'
      });
    }
  }
};

// Alternative admin middleware that works with regular auth middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. User not authenticated.'
    });
  }

  // Allow hardcoded admin or database admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};
