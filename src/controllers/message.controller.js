import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getReceiverSocketId, getWhoSlectedWhom, io } from "../app.js";
import { Admin } from "../models/admin.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { s3Client } from "./admin.controller.js";

async function sendNotifyEmail(sender, receiver) {
  // create the msg body
  const mailOptions = {
    to: receiver.email,
    from: process.env.SENDGRID_EMAIL,
    subject: "New Message Alert - MyClinic",
    text: `Hi ${receiver.fullName}
We wanted to inform you that you have new message from ${sender.fullName}. Please check it at your earliest convenience. Click the following link to view: ${process.env.FRONTEND_URL}.`,
  };
  // Send the email
  try {
    console.log("Msg Notify email sending...");
    await sgMail.send(mailOptions);
    console.log("Notify email sent successfully");
  } catch (error) {
    console.error("Error sending Notify email:", error);
  }
}

const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.admin._id;

  const receiver = await Admin.findById(receiverId);

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    message,
  });
  await newMessage.save();

  if (newMessage) {
    conversation.messages.push(newMessage._id);
    conversation.lastMessageText = newMessage.message;
    conversation.lastMessageSenderId = newMessage.senderId;
    conversation.lastMessageTime = new Date();
    conversation.lastMessageId = newMessage._id;
    conversation.seen = false;
    await conversation.save();
  }

  // SOCKET IO FUNCTIONALITY WILL GO HERE
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    // io.to(<socket_id>).emit() used to send events to specific client
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  const isThisReceiverSelectedBySender =
    getWhoSlectedWhom(receiverId?.toString()) === senderId?.toString();


  // send notification email to receiver
  if (
    !isThisReceiverSelectedBySender &&
    receiver.emailNotify &&
    receiver.emailNotifyDelay === "Immediately"
  ) {
    sendNotifyEmail(req.admin, receiver);
  } else if (receiver.emailNotify && receiver.emailNotifyDelay === "15m") {
    setTimeout(
      () => {
        sendNotifyEmail(req.admin, receiver);
      },
      15 * 60 * 1000
    );
  } else if (receiver.emailNotify && receiver.emailNotifyDelay === "1h") {
    setTimeout(
      () => {
        sendNotifyEmail(req.admin, receiver);
      },
      60 * 60 * 1000
    );
  }

  res.status(201).json(
    new ApiResponse(201, {
      success: true,
      newMessage,
    })
  );
});

const getMessages = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.admin._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  }).populate("messages");

  if (!conversation)
    return res.status(200).json(
      new ApiResponse(200, {
        messages: [],
      })
    );

  if (
    conversation?.lastMessageSenderId?.toString() !== senderId &&
    !conversation.seen
  ) {
    conversation.seen = true;
    await conversation.save();
  }
  const messages = conversation.messages;

  res.status(200).json(
    new ApiResponse(200, {
      messages,
    })
  );
});

const updateMessage = asyncHandler(async (req, res) => {
  const { id: messageId } = req.params;
  const userId = req.admin._id;

  const message = await Message.findById(messageId);
  const conversation = await Conversation.findOne({
    participants: { $all: [message.senderId, message.receiverId] },
  });
  if (!message) {
    return res.status(404).json(
      new ApiResponse(404, {
        message: "Message not found",
      })
    );
  }
  if (message.senderId.toString() != userId) {
    return res.status(403).json(
      new ApiResponse(403, {
        message: "You are not allowed to update this message",
      })
    );
  }
  message.message = req.body.message;
  await message.save();

  if (message._id.toString() === conversation?.lastMessageId?.toString()) {
    conversation.lastMessageText = message.message;
    conversation.lastMessageTime = new Date();
    await conversation.save();
  }
  const receiverSocketId = getReceiverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("reloadConvo", message.receiverId);
  }
  return res.status(200).json(
    new ApiResponse(200, {
      message,
    })
  );
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { id: messageId } = req.params;
  const userId = req.admin._id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json(
      new ApiResponse(404, {
        message: "Message not found",
      })
    );
  }
  if (message.senderId.toString() != userId) {
    return res.status(403).json(
      new ApiResponse(403, {
        message: "You are not allowed to delete this message",
      })
    );
  }
  const conversation = await Conversation.findOne({
    participants: { $all: [message.senderId, message.receiverId] },
  });

  const updatedConvo = await Conversation.findOneAndUpdate(
    {
      participants: { $all: [message.senderId, message.receiverId] },
    },
    {
      $pull: { messages: messageId },
    },
    { new: true }
  );

  if (conversation?.lastMessageId?.toString() === messageId) {
    if (updatedConvo.messages.length === 0) {
      updatedConvo.lastMessageId = undefined;
      updatedConvo.lastMessageText = undefined;
      updatedConvo.lastMessageTime = undefined;
      updatedConvo.lastMessageSenderId = undefined;
      await updatedConvo.save();
    } else {
      const lastMessage = await Message.findById(
        updatedConvo.messages[updatedConvo.messages.length - 1]
      );
      updatedConvo.lastMessageId = lastMessage._id;
      updatedConvo.lastMessageText = lastMessage.message;
      updatedConvo.lastMessageTime = lastMessage.createdAt;
      updatedConvo.lastMessageSenderId = lastMessage.senderId;
      await updatedConvo.save();
    }
  }

  const receiverSocketId = getReceiverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("reloadConvo", message.receiverId);
  }
  await Message.findByIdAndDelete(messageId);

  return res.status(200).json(
    new ApiResponse(200, {
      message: "Message deleted",
    })
  );
});

const getConversations = asyncHandler(async (req, res) => {
  const senderId = req.admin._id;

  const conversations = await Admin.find({
    _id: { $ne: senderId },
    isActive: true,
  });

  let clonedConvo = [];

  for (let index = 0; index < conversations.length; index++) {
    const convo = conversations[index];

    clonedConvo.push({ ...convo._doc });

    if (convo.avatarName) {
      clonedConvo[index].avatar = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `images/${clonedConvo[index].avatarName}`,
        }),
        { expiresIn: 3600 }
      );
    }
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, clonedConvo[index]._id] },
    });

    if (conversation) {
      clonedConvo[index].lastMessageText =
        conversation?.lastMessageText || undefined;
      clonedConvo[index].lastMessageTime =
        conversation?.lastMessageTime || undefined;
      clonedConvo[index].lastMessageSenderId =
        conversation?.lastMessageSenderId || undefined;
      clonedConvo[index].seen = conversation?.seen;
    }
  }
  clonedConvo.sort((a, b) => {
    if (!a.lastMessageTime && !b.lastMessageTime) {
      return 0;
    } else if (!a.lastMessageTime) {
      return 1;
    } else if (!b.lastMessageTime) {
      return -1;
    }
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });
  return res.status(200).json(
    new ApiResponse(200, {
      conversations: clonedConvo,
    })
  );
});

export {
  deleteMessage,
  getConversations,
  getMessages,
  sendMessage,
  updateMessage,
};
