import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    room: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    priority: {
      type: String,
      enum: ["bassa", "media", "alta"],
      default: "media",
    },
    status: {
      type: String,
      enum: ["aperta", "in-lavorazione", "risolta"],
      default: "aperta",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Report", reportSchema);
