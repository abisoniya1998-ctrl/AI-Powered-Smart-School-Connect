import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    grade: { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: "" },
    body: { type: String, required: true, trim: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    aiAssisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);