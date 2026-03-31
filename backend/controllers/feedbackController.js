import Feedback from '../models/Feedback.js';
import StudySession from '../models/StudySession.js';

/**
 * Students create feedback for a tutor session.
 */
export const createFeedback = async (req, res) => {
  try {
    // Client should send: studentName, sessionId, rating, message.
    // We derive tutorId + tutorName from the StudySession stored in MongoDB.
    const { studentName, sessionId, rating, message } = req.body;

    if (!studentName || !String(studentName).trim()) {
      return res.status(400).json({ success: false, message: 'studentName is required' });
    }
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
    }

    const session = await StudySession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const feedback = await Feedback.create({
      studentName: String(studentName).trim(),
      tutorId: session.tutorId,
      tutorName: session.tutorName,
      sessionId: session._id,
      rating,
      message,
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Tutor reads feedback and aggregated rating.
 * Returns { averageRating, count, feedbacks }.
 */
export const getTutorFeedbackAndRating = async (req, res) => {
  try {
    const { tutorId } = req.params;

    // Populate session details so the frontend can show the real session title.
    const feedbacks = await Feedback.find({ tutorId })
      .sort({ createdAt: -1 })
      .populate('sessionId', 'title date time subject tutorName');

    if (feedbacks.length === 0) {
      return res.json({ success: true, averageRating: 0, count: 0, feedbacks: [] });
    }

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const average = sum / feedbacks.length;

    res.json({
      success: true,
      averageRating: Number(average.toFixed(2)),
      count: feedbacks.length,
      feedbacks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};