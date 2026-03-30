const TutorApplication = require("../models/TutorApplication");
const Tutor = require("../models/Tutor");
const Notice = require("../models/Notice");

exports.createApplication = async (req, res) => {
  try {
    const application = await TutorApplication.create(req.body);
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const apps = await TutorApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorName = req.body.coordinatorName || "Coordinator";

    const application = await TutorApplication.findById(id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    application.status = "approved";
    application.decisionBy = coordinatorName;
    application.decisionAt = new Date();
    await application.save();

    // Create tutor
    const tutor = await Tutor.create({
      studentName: application.studentName,
      studentId: application.studentId,
      email: application.email,
      subjects: [application.subject],
      isActive: true
    });

    // Notice for notice board
    await Notice.create({
      type: "tutor",
      title: "New tutor assigned",
      message: `New tutor assigned: ${tutor.studentName} for subject ${application.subject}`
    });

    res.json({
      success: true,
      message: "Application approved. Tutor created.",
      data: { application, tutor }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorName = req.body.coordinatorName || "Coordinator";

    const application = await TutorApplication.findById(id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    application.status = "rejected";
    application.decisionBy = coordinatorName;
    application.decisionAt = new Date();
    await application.save();

    res.json({ success: true, message: "Application rejected.", data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};