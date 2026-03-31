import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    // Newer notice-board workflow uses these.
    type: { type: String, default: 'general' },
    title: { type: String, required: true },
    message: { type: String, default: '' },

    // Existing notice-management workflow uses these.
    content: { type: String, default: '' },
    targetAudience: {
      type: String,
      enum: ['students', 'tutors', 'coordinators', 'all'],
      default: 'all',
    },
    module: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '' },
    scheduledAt: { type: Date, default: null },
    isPublished: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('Notice', noticeSchema);
