import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true },
    category: { type: String, required: true },
    university: { type: String, default: "N/A" },
    studentsCount: { type: Number, required: true },
    preferredTime: [{ type: String }],
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    source: {
      type: String,
      enum: ["Tutor", "Dashboard"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
