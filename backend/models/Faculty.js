import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: "🏛️" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
