import mongoose from "mongoose";

const tutorApplicationSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    experience: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    decisionBy: { type: String },
    decisionAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("TutorApplication", tutorApplicationSchema);