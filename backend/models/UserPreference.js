import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    faculty:  { id: String, name: String },
    year:     { id: String, name: String },
    semester: { id: String, name: String },
    module:   { id: String, name: String },
  },
  { timestamps: true }
);

export default mongoose.model("UserPreference", userPreferenceSchema);
