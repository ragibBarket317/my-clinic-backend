import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    content: String,
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
export const Notification = mongoose.model("Notification", notificationSchema);
