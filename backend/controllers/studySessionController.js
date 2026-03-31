import StudySession from '../models/StudySession.js';
import Tutor from '../models/Tutor.js';
import Notice from '../models/Notice.js';

/**
 * Tutor creates a study session.
 * Only tutors that exist in the `Tutor` collection (created when an application is approved)
 * can create sessions.
 *
 * Notes:
 * - `tutorName` from the client is ignored; we always derive it from the DB Tutor record.
 * - Session subject can be validated against the tutor's approved subjects.
 */
export const createSession = async (req, res) => {
  try {
    const { studentId, subject, title, date, time, meetingLink, description } = req.body;

    const cleanStudentId = (studentId || '').trim();
    if (!cleanStudentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    const tutor = await Tutor.findOne({ studentId: cleanStudentId });
    if (!tutor || !tutor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Tutor not found (or not active). Please wait for coordinator approval.',
      });
    }

    if (tutor.subjects?.length) {
      const allowed = tutor.subjects.includes(subject);
      if (!allowed) {
        return res.status(400).json({
          success: false,
          message: `This tutor is not approved for subject "${subject}".`,
        });
      }
    }

    const session = await StudySession.create({
      tutorId: tutor._id,
      tutorName: tutor.studentName,
      subject,
      title,
      date,
      time,
      meetingLink,
      description,
    });

    // Create notice so students can discover the session.
    await Notice.create({
      type: 'session',
      title: `New study session: ${title}`,
      message: `${session.tutorName} is hosting a session on ${subject} at ${date} ${time}.`,
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Public: list all sessions (used by the Notice Board UI).
 */
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find().sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Tutor: list only sessions created by the tutor with the given `studentId`.
 */
export const getSessionsByTutorStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const cleanStudentId = (studentId || '').trim();

    const tutor = await Tutor.findOne({ studentId: cleanStudentId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    const sessions = await StudySession.find({ tutorId: tutor._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};