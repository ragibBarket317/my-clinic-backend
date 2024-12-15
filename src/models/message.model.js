import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
