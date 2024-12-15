import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Patient", // Reference to the Patient model
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Admin", // Reference to the Admin model (editor)
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    fullName:String
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);
