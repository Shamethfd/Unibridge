const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },

    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
    tutorName: { type: String, required: true },

    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "StudySession", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);