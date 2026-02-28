import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@learnbridge.com',
  password: '123456'
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Admin login (hardcoded credentials)
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check against hardcoded credentials
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Create admin user object for token generation
    const adminUser = {
      _id: 'admin-hardcoded',
      email: ADMIN_CREDENTIALS.email,
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator'
      }
    };

    // Generate token
    const token = generateToken(adminUser._id);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: adminUser,
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login',
      error: error.message
    });
  }
};

// @desc    Create Resource Manager or Coordinator (Admin only)
// @route   POST /api/admin/create-user
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      bio, 
      role 
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: username, email, password, firstName, lastName, role'
      });
    }

    // Validate role
    if (!['resourceManager', 'coordinator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either resourceManager or coordinator'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user with hashed password
    const user = await User.create({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      role,
      profile: {
        firstName,
        lastName,
        phone,
        bio
      }
    });

    // Remove password from output
    const userWithoutPassword = user.toJSON();

    res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating user',
      error: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    // Build query
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
      error: error.message
    });
  }
};
