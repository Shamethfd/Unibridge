import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['student', 'tutor'],
          required: true,
        },
      },
    ],
    lastMessage: {
      text: String,
      senderId: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ updatedAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
