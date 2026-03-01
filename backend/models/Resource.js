import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  // Academic hierarchy fields
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    validate: {
      validator: Number.isInteger,
      message: 'Year must be an integer between 1 and 4'
    }
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2,
    validate: {
      validator: Number.isInteger,
      message: 'Semester must be 1 or 2'
    }
  },
  module: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // Reference to Module (optional for backward compatibility)
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: false // Optional for backward compatibility
  },
  category: {
    type: String,
    required: false, // Made optional since module is now primary
    enum: ['lecture', 'assignment', 'tutorial', 'reference', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: 500
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better search performance
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ status: 1 });
resourceSchema.index({ reviewedBy: 1 });
resourceSchema.index({ year: 1, semester: 1 });
resourceSchema.index({ module: 1 });
resourceSchema.index({ year: 1, semester: 1, module: 1 }); // Composite index for filtering

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
