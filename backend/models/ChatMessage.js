import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'tutor'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        kind: { type: String, enum: ['image', 'document'], required: true },
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

// Index for faster queries
chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
