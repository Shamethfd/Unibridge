import Conversation from '../models/Conversation.js';
import ChatMessage from '../models/ChatMessage.js';
import Tutor from '../models/Tutor.js';
import User from '../models/User.js';

const normalize = (value) => String(value || '').trim();

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findUserByEmailInsensitive = async (email) => {
  const clean = normalize(email);
  if (!clean) return null;
  return User.findOne({ email: { $regex: `^${escapeRegex(clean)}$`, $options: 'i' } }).select('_id email');
};

const resolveTutorUserId = async (rawTutorIdentifier) => {
  const identifier = normalize(rawTutorIdentifier);
  if (!identifier) return null;

  // Direct user id path.
  let user = await User.findById(identifier).select('_id email');
  if (user) return user._id;

  // Tutor document id path.
  let tutor = await Tutor.findById(identifier).select('email studentId');

  // Student id path.
  if (!tutor && /^IT\d{8}$/i.test(identifier)) {
    tutor = await Tutor.findOne({ studentId: identifier.toUpperCase() }).select('email studentId');
  }

  // Email path.
  if (!tutor && identifier.includes('@')) {
    tutor = await Tutor.findOne({ email: identifier.toLowerCase() }).select('email studentId');
  }

  const tutorEmail = normalize(tutor?.email).toLowerCase();
  if (!tutorEmail) return null;

  user = await findUserByEmailInsensitive(tutorEmail);
  return user?._id || null;
};

const reconcileTutorConversationIdsForUser = async (user) => {
  const userEmail = normalize(user?.email).toLowerCase();
  if (!userEmail) return;

  const tutor = await Tutor.findOne({ email: { $regex: `^${escapeRegex(userEmail)}$`, $options: 'i' } }).select('_id');
  if (!tutor) return;

  // Backfill old conversations created with Tutor._id instead of User._id.
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

// Get list of available tutors for a student
export const getAvailableTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({ isActive: true }).select('studentName studentId email subjects');

    const mapped = await Promise.all(
      tutors.map(async (tutor) => {
        const user = await findUserByEmailInsensitive(tutor.email);
        return {
          _id: tutor._id,
          studentName: tutor.studentName,
          studentId: tutor.studentId,
          email: tutor.email,
          subjects: tutor.subjects || [],
          userId: user?._id || null,
        };
      })
    );

    // Return all active tutors so the picker is never empty due to mapping gaps.
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get or create a conversation between student and tutor
export const startOrGetConversation = async (req, res) => {
  try {
    const { tutorUserId } = req.body;
    const studentUserId = req.user.id;
    const resolvedTutorUserId = await resolveTutorUserId(tutorUserId);

    if (!resolvedTutorUserId) {
      return res.status(400).json({ error: 'Invalid tutor identifier' });
    }

    if (resolvedTutorUserId.toString() === studentUserId.toString()) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { userId: studentUserId } },
          { $elemMatch: { userId: resolvedTutorUserId } },
        ],
      },
    });

    // If not, create new conversation
    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { userId: studentUserId, role: 'student' },
          { userId: resolvedTutorUserId, role: 'tutor' },
        ],
      });
      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for current user
export const getUserConversations = async (req, res) => {
  try {
    await reconcileTutorConversationIdsForUser(req.user);

    const userId = req.user.id;

    const conversations = await Conversation.find({
      'participants.userId': userId,
    })
      .populate('participants.userId', 'profile.firstName profile.lastName email username')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation details with messages
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

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

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await ChatMessage.find({ conversationId })
      .populate('senderId', 'profile.firstName profile.lastName email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await ChatMessage.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Update unread messages to read
    const result = await ChatMessage.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete conversation (soft delete - just mark inactive)
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

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

    await Conversation.findByIdAndUpdate(conversationId, {
      isActive: false,
    });

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
