import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT, and images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Submit a new resource (student only)
// @route   POST /api/resources/submit
// @access  Private (student)
export const submitResource = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, description, category, tags } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }

      // Parse tags if provided
      const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      const resource = await Resource.create({
        title,
        description,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: category || 'other',
        uploadedBy: req.user._id,
        tags: parsedTags,
        status: 'pending' // All submitted resources start as pending
      });

      // Populate user details
      await resource.populate('uploadedBy', 'username profile.firstName profile.lastName');

      res.status(201).json({
        success: true,
        message: 'Resource submitted for review',
        data: {
          resource
        }
      });
    } catch (error) {
      console.error('Submit resource error:', error);
      
      // Remove uploaded file if there was an error
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Server error submitting resource',
        error: error.message
      });
    }
  }
];

// @desc    Get pending resources (resourceManager only)
// @route   GET /api/resources/pending
// @access  Private (resourceManager)
export const getPendingResources = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const resources = await Resource.find({ status: 'pending' })
      .populate('uploadedBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Resource.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        resources,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get pending resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending resources',
      error: error.message
    });
  }
};

// @desc    Approve resource (resourceManager only)
// @route   PUT /api/resources/:id/approve
// @access  Private (resourceManager)
export const approveResource = async (req, res) => {
  try {
    const { category, reviewNotes } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Resource has already been reviewed'
      });
    }

    // Update resource with approval
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        category: category || resource.category,
        reviewedBy: req.user._id,
        reviewDate: new Date(),
        reviewNotes: reviewNotes || ''
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('uploadedBy reviewedBy', 'username profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      message: 'Resource approved successfully',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving resource',
      error: error.message
    });
  }
};

// @desc    Reject resource (resourceManager only)
// @route   PUT /api/resources/:id/reject
// @access  Private (resourceManager)
export const rejectResource = async (req, res) => {
  try {
    const { reviewNotes } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Resource has already been reviewed'
      });
    }

    // Update resource with rejection
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        reviewedBy: req.user._id,
        reviewDate: new Date(),
        reviewNotes: reviewNotes || ''
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('uploadedBy reviewedBy', 'username profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      message: 'Resource rejected successfully',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    console.error('Reject resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting resource',
      error: error.message
    });
  }
};

// @desc    Get approved resources (public access)
// @route   GET /api/resources/approved
// @access  Public
export const getApprovedResources = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    // Build query
    let query = { status: 'approved' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Resource.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        resources,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get approved resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching approved resources',
      error: error.message
    });
  }
};

// @desc    Update resource (resourceManager only)
// @route   PUT /api/resources/:id
// @access  Private (resourceManager)
export const updateResource = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Parse tags if provided
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : resource.tags;

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        tags: parsedTags
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('uploadedBy', 'username profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating resource',
      error: error.message
    });
  }
};

// @desc    Delete resource (resourceManager only)
// @route   DELETE /api/resources/:id
// @access  Private (resourceManager)
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', path.basename(resource.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting resource',
      error: error.message
    });
  }
};

// @desc    Get resource statistics (resourceManager only)
// @route   GET /api/resources/stats
// @access  Private (resourceManager)
export const getResourceStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Resource.countDocuments({ status: 'pending' }),
      Resource.countDocuments({ status: 'approved' }),
      Resource.countDocuments({ status: 'rejected' }),
      Resource.countDocuments() // Total resources
    ]);

    res.status(200).json({
      success: true,
      data: {
        pending: stats[0],
        approved: stats[1],
        rejected: stats[2],
        total: stats[3]
      }
    });
  } catch (error) {
    console.error('Get resource stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching resource statistics',
      error: error.message
    });
  }
};
