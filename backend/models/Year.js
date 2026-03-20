import mongoose from "mongoose";

const yearSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Year", yearSchema);
