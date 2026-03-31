import Tutor from '../models/Tutor.js';
import TutorApplication from '../models/TutorApplication.js';

/**
 * Get tutor record by `studentId` (used by Tutor UI to prefill data).
 */
export const getTutorByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const cleanStudentId = (studentId || '').trim();

    if (!cleanStudentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    const tutor = await Tutor.findOne({ studentId: cleanStudentId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    res.json({ success: true, data: tutor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get the latest application status for a given `studentId`.
 * This helps the UI explain whether the tutor is approved or still pending.
 */
export const getLatestApplicationByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const cleanStudentId = (studentId || '').trim();

    if (!cleanStudentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    const application = await TutorApplication.findOne({ studentId: cleanStudentId }).sort({ createdAt: -1 });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

