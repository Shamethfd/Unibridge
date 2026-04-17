import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import Tutor from '../models/Tutor.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const normalize = (value) => String(value || '').trim();
const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads', 'chat');

const ensureUploadsDir = () => {
  fs.mkdirSync(uploadsDir, { recursive: true });
};

const getAttachmentKind = (mimeType = '', filename = '') => {
  if (String(mimeType).startsWith('image/')) return 'image';
  const ext = path.extname(filename).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].includes(ext)) return 'image';
  return 'document';
};

const mapAttachments = (files = []) => {
  ensureUploadsDir();
  return files.map((file) => ({
    url: `/uploads/chat/${file.filename}`,
    name: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    kind: getAttachmentKind(file.mimetype, file.originalname),
  }));
};

const reconcileTutorConversationIdsForUser = async (user) => {
  const userEmail = normalize(user?.email).toLowerCase();
  if (!userEmail) return;

  const tutor = await Tutor.findOne({ email: { $regex: `^${escapeRegex(userEmail)}$`, $options: 'i' } }).select('_id');
  if (!tutor) return;

  await Conversation.updateMany(
    {
      participants: {
        $elemMatch: {
          role: 'tutor',
          userId: tutor._id,
        },
      },
    },
    {
      $set: {
        'participants.$[p].userId': user._id,
      },
    },
    {
      arrayFilters: [{ 'p.role': 'tutor', 'p.userId': tutor._id }],
    }
  );
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const text = String(req.body.text || '').trim();
    const senderId = req.user.id;
    const attachments = mapAttachments(req.files || []);

    if (!text && attachments.length === 0) {
      return res.status(400).json({ error: 'Message text or attachment is required' });
    }

    // Validate conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === senderId.toString()
    );
    if (!participant) {
      return res.status(403).json({ error: 'Not a participant in this conversation' });
    }

    // Create and save message
    const message = new ChatMessage({
      conversationId,
      senderId,
      senderRole: participant.role,
      text: text || '[Attachment]',
      attachments,
    });

    await message.save();
    await message.populate('senderId', 'profile.firstName profile.lastName email username');

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: text || (attachments.length > 0 ? 'Sent an attachment' : ''),
        senderId,
        timestamp: new Date(),
      },
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unread message count for a conversation
export const getUnreadCount = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Check if user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const unreadCount = await ChatMessage.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total unread messages for user across all conversations
export const getTotalUnreadCount = async (req, res) => {
  try {
    await reconcileTutorConversationIdsForUser(req.user);

    const userId = req.user.id;

    // Get all conversation IDs where user is participant
    const conversations = await Conversation.find({
      'participants.userId': userId,
    }).select('_id');

    const conversationIds = conversations.map((c) => c._id);

    const totalUnread = await ChatMessage.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      isRead: false,
    });

    res.json({ totalUnread });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message (soft delete)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as deleted
    await ChatMessage.findByIdAndUpdate(messageId, {
      text: '[Message deleted]',
    });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
