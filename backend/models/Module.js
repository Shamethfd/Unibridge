import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester'
  },
  description: {
    type: String,
    default: ''
  },
  requestCount: {
    type: Number,
    default: 0
  },
  year: {
    type: Number,
    min: 1,
    max: 4,
    validate: {
      validator: (value) => value === undefined || Number.isInteger(value),
      message: 'Year must be an integer between 1 and 4'
    }
  },
  semester: {
    type: Number,
    min: 1,
    max: 2,
    validate: {
      validator: (value) => value === undefined || Number.isInteger(value),
      message: 'Semester must be 1 or 2'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
moduleSchema.index({ year: 1, semester: 1 });
moduleSchema.index({ name: 1 });
moduleSchema.index({ createdBy: 1 });
moduleSchema.index({ year: 1, semester: 1, name: 1 }); // Composite index
moduleSchema.index({ semesterId: 1 });

const Module = mongoose.model('Module', moduleSchema);

export default Module;
