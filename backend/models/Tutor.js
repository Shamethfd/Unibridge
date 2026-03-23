const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    subjects: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tutor", tutorSchema);