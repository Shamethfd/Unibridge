import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
moduleSchema.index({ year: 1, semester: 1 });
moduleSchema.index({ name: 1 });
moduleSchema.index({ createdBy: 1 });
moduleSchema.index({ year: 1, semester: 1, name: 1 }); // Composite index

const Module = mongoose.model('Module', moduleSchema);

export default Module;
