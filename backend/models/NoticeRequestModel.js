import mongoose from 'mongoose';

const noticeRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  module: { type: String, default: '' },
  targetAudience: { type: String, enum: ['all', 'students', 'tutors', 'coordinators'], default: 'all' },
  requestedBy: { type: String, required: true },
  role: { type: String, enum: ['tutor', 'coordinator'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('NoticeRequest', noticeRequestSchema);