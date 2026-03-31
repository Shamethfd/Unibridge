import TutorNotification from '../models/TutorNotification.js';

/**
 * List notifications for a tutor by their student ID (newest first).
 */
export const getByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const clean = (studentId || '').trim();
    if (!clean) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    const items = await TutorNotification.find({ studentId: clean }).sort({ createdAt: -1 });
    const unreadCount = await TutorNotification.countDocuments({ studentId: clean, read: false });

    res.json({ success: true, data: items, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Mark one notification as read.
 */
export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await TutorNotification.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!n) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: n });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Mark all notifications as read for a studentId.
 */
export const markAllRead = async (req, res) => {
  try {
    const { studentId } = req.params;
    const clean = (studentId || '').trim();
    if (!clean) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    await TutorNotification.updateMany(
      { studentId: clean, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All marked read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
