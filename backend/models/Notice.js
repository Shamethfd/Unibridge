import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // "tutor" | "session"
    title: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Notice', noticeSchema);