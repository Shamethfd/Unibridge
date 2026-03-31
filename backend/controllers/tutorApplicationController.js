import TutorApplication from '../models/TutorApplication.js';
import Tutor from '../models/Tutor.js';
import Notice from '../models/Notice.js';
import TutorNotification from '../models/TutorNotification.js';

/**
 * Tutor submits a new application.
 * Notes:
 * - We explicitly persist only the allowed fields from the request body.
 * - Status is set by the schema default (pending) to prevent client tampering.
 */
export const createApplication = async (req, res) => {
  try {
    const application = await TutorApplication.create({
      studentName: req.body.studentName,
      studentId: req.body.studentId,
      email: req.body.email,
      subject: req.body.subject,
      experience: req.body.experience,
      description: req.body.description,
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Coordinator lists all applications (used for review + accept/reject).
 */
export const getAllApplications = async (req, res) => {
  try {
    const apps = await TutorApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Coordinator accepts an application.
 * Side effects:
 * - Updates application status to `approved`.
 * - Creates or updates the corresponding `Tutor` record in the DB.
 * - Creates a `Notice` so students can discover the newly assigned tutor.
 */
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const decisionBy = req.body.decisionBy ?? req.body.coordinatorName ?? undefined;

    const application = await TutorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Application is already ${application.status}.`,
      });
    }

    application.status = 'approved';
    application.decisionBy = decisionBy;
    application.decisionAt = new Date();
    await application.save();

    // Create tutor if missing; otherwise update the existing record.
    const existingTutor = await Tutor.findOne({ studentId: application.studentId });

    let tutor;
    if (existingTutor) {
      const nextSubjects = new Set([...(existingTutor.subjects || []), application.subject]);
      existingTutor.studentName = application.studentName;
      existingTutor.email = application.email;
      existingTutor.subjects = [...nextSubjects];
      existingTutor.isActive = true;
      await existingTutor.save();
      tutor = existingTutor;
    } else {
      tutor = await Tutor.create({
        studentName: application.studentName,
        studentId: application.studentId,
        email: application.email,
        subjects: [application.subject],
        isActive: true,
      });
    }

    // Notice for the notice board.
    await Notice.create({
      type: 'tutor',
      title: 'New tutor assigned',
      message: `New tutor assigned: ${tutor.studentName} for subject ${application.subject}`,
    });

    // Personal message for tutor (shown on Tutor → Messages / Dashboard).
    await TutorNotification.create({
      studentId: application.studentId,
      type: 'application_approved',
      title: 'You are now a tutor',
      message: `Congratulations ${tutor.studentName}! The coordinator approved your application to tutor ${application.subject}. You can create study sessions from your dashboard.`,
      applicationId: application._id,
    });

    res.json({
      success: true,
      message: 'Application approved.',
      data: { application, tutor },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Coordinator rejects an application.
 * Side effects:
 * - Updates application status to `rejected`.
 * - Does not create any `Tutor` record.
 */
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const decisionBy = req.body.decisionBy ?? req.body.coordinatorName ?? undefined;

    const application = await TutorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Application is already ${application.status}.`,
      });
    }

    application.status = 'rejected';
    application.decisionBy = decisionBy;
    application.decisionAt = new Date();
    await application.save();

    await TutorNotification.create({
      studentId: application.studentId,
      type: 'application_rejected',
      title: 'Tutor application update',
      message: `Your tutor application for ${application.subject} was not approved at this time. You may contact the coordinator for more information.`,
      applicationId: application._id,
    });

    res.json({ success: true, message: 'Application rejected.', data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};