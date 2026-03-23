const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // "tutor" | "session"
    title: { type: String, required: true },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);