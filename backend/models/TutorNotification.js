import mongoose from 'mongoose';

/**
 * Personal messages for a tutor (e.g. "You are now a tutor" after coordinator approval).
 * Targeted by university studentId (same as Tutor.studentId).
 */
const tutorNotificationSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['application_approved', 'application_rejected'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorApplication' },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('TutorNotification', tutorNotificationSchema);
