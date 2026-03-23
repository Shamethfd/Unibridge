const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
    tutorName: { type: String, required: true },

    subject: { type: String, required: true },
    title: { type: String, required: true },

    date: { type: String, required: true }, // keep simple for beginners
    time: { type: String, required: true },

    meetingLink: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudySession", studySessionSchema);