import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
    description: { type: String, default: "" },
    requestCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Module", moduleSchema);
