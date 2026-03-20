import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    yearId: { type: mongoose.Schema.Types.ObjectId, ref: "Year", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Semester", semesterSchema);
