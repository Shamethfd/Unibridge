import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetAudience: {
    type: String,
    enum: ['students', 'tutors', 'coordinators', 'all'],
    default: 'all'
  },
  module: { type: String, default: '' },
  scheduledAt: { type: Date, default: null },
  isPublished: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('Notice', noticeSchema);
