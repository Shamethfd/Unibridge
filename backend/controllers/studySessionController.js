const StudySession = require("../models/StudySession");
const Tutor = require("../models/Tutor");
const Notice = require("../models/Notice");

exports.createSession = async (req, res) => {
  try {
    const {
      studentId,     // tutor's student ID (not Mongo _id)
      tutorName,
      subject,
      title,
      date,
      time,
      meetingLink,
      description
    } = req.body;

    const cleanStudentId = (studentId || "").trim();

    const tutor = await Tutor.findOne({ studentId: cleanStudentId });
    if (!tutor) {
      return res.status(400).json({ success: false, message: "Tutor not found for this student ID" });
    }

    const session = await StudySession.create({
      tutorId: tutor._id,
      tutorName: tutorName || tutor.studentName,
      subject,
      title,
      date,
      time,
      meetingLink,
      description
    });

    await Notice.create({
      type: "session",
      title: `New study session: ${title}`,
      message: `${session.tutorName} is hosting a session on ${subject} at ${date} ${time}.`
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find().sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};