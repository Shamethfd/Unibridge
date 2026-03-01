import Module from '../models/Module.js';
import User from '../models/User.js';

// @desc    Create a new module (resourceManager only)
// @route   POST /api/modules
// @access  Private (resourceManager)
export const createModule = async (req, res) => {
  try {
    const { name, year, semester } = req.body;

    // Validation
    if (!name || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Module name, year, and semester are required'
      });
    }

    // Check if module already exists for this year/semester
    const existingModule = await Module.findOne({
      name: name.trim(),
      year: parseInt(year),
      semester: parseInt(semester)
    });

    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: 'A module with this name already exists for this year and semester'
      });
    }

    // Create new module
    const module = await Module.create({
      name: name.trim(),
      year: parseInt(year),
      semester: parseInt(semester),
      createdBy: req.user._id
    });

    // Populate user details
    await module.populate('createdBy', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: {
        module
      }
    });
  } catch (error) {
    console.error('Create module error:', error);
    
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
      message: 'Server error creating module',
      error: error.message
    });
  }
};

// @desc    Get modules by year and semester (public access)
// @route   GET /api/modules?year=1&semester=1
// @access  Public
export const getModulesByYearSemester = async (req, res) => {
  try {
    const { year, semester, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (semester) {
      query.semester = parseInt(semester);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const modules = await Module.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Module.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        modules,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching modules',
      error: error.message
    });
  }
};

// @desc    Update a module (resourceManager only)
// @route   PUT /api/modules/:id
// @access  Private (resourceManager)
export const updateModule = async (req, res) => {
  try {
    const { name, year, semester } = req.body;
    const { id } = req.params;

    // Validation
    if (!name || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Module name, year, and semester are required'
      });
    }

    // Find module
    const module = await Module.findById(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if new name conflicts with existing module (excluding current one)
    const existingModule = await Module.findOne({
      _id: { $ne: id },
      name: name.trim(),
      year: parseInt(year),
      semester: parseInt(semester)
    });

    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: 'A module with this name already exists for this year and semester'
      });
    }

    // Update module
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        year: parseInt(year),
        semester: parseInt(semester)
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'username profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: {
        module: updatedModule
      }
    });
  } catch (error) {
    console.error('Update module error:', error);
    
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
      message: 'Server error updating module',
      error: error.message
    });
  }
};

// @desc    Delete a module (resourceManager only)
// @route   DELETE /api/modules/:id
// @access  Private (resourceManager)
export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    // Find module
    const module = await Module.findById(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if there are resources associated with this module
    const Resource = (await import('../models/Resource.js')).default;
    const resourceCount = await Resource.countDocuments({ module: module.name });

    if (resourceCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete module. It has associated resources. Please delete or reassign the resources first.'
      });
    }

    // Delete module
    await Module.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting module',
      error: error.message
    });
  }
};

// @desc    Get single module by ID (public access)
// @route   GET /api/modules/:id
// @access  Public
export const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findById(id)
      .populate('createdBy', 'username profile.firstName profile.lastName');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        module
      }
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching module',
      error: error.message
    });
  }
};
