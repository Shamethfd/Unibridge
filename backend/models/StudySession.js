import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
    tutorName: { type: String, required: true },

    subject: { type: String, required: true },
    title: { type: String, required: true },

    // Keep simple for beginners (use ISO date string).
    date: { type: String, required: true },
    time: { type: String, required: true },

    meetingLink: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('StudySession', studySessionSchema);