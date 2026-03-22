import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    moduleName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Lecture Discussion",
        "Mid Past Paper Discussion",
        "Final Past Paper Discussion",
        "Others",
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      minlength: [1, 'Description cannot be empty.'],
    },
    urgency: {
      type: String,
      enum: ["Normal", "Urgent", "Exam Priority"],
      default: "Normal",
    },
    preferredTime: [{ type: String }],
    studentsCount: { type: Number, default: 1 },
    heatScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    inviteToken: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-calculate heat score before saving (Mongoose v9 async hook - no next() needed)
requestSchema.pre("save", async function () {
  const urgencyScore =
    this.urgency === "Exam Priority" ? 30 : this.urgency === "Urgent" ? 20 : 10;
  const demandScore = this.studentsCount * 10;
  const timeScore = this.preferredTime && this.preferredTime.length > 0 ? 15 : 0;
  this.heatScore = demandScore + urgencyScore + timeScore;
});

export default mongoose.model("Request", requestSchema);
