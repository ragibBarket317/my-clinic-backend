// models/Document.js
import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    //public or private
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    permission: {
      type: [{ type: String }],
      default: [],
    },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
