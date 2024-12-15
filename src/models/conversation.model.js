import mongoose, { Schema } from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
    lastMessageText: String,
    lastMessageTime: Date,
    lastMessageSenderId: Schema.Types.ObjectId,
    lastMessageId: Schema.Types.ObjectId,
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
