import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
import cron from "node-cron";
import nodemailer from "nodemailer";
import { Admin } from "../models/admin.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Notification } from "../models/notification.model.js";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendNotifyEmailNote(admin, noteCount) {
  // create the msg body
  const mailOptions = {
    to: admin.email,
    from: process.env.SENDGRID_EMAIL,
    subject: "New Note Notification",
    text: `Hi ${admin.fullName},
We wanted to let you know that you have ${noteCount} unread notes. Please review it at your earliest convenience. Click the following link to view: ${process.env.FRONTEND_URL}`,
  };
  // Send the email
  try {
    await sgMail.send(mailOptions);
    console.log("Notify email sent successfully");
  } catch (error) {
    console.error("Error sending Notify email:", error);
  }
}
async function sendNotifyEmailMsg(admin, messageCount) {
  // create the msg body
  const mailOptions = {
    to: admin.email,
    from: process.env.SENDGRID_EMAIL,
    subject: "New Message Notification",
    text: `Hi ${admin.fullName},
We wanted to let you know that you have ${messageCount} unread messages. Please review it at your earliest convenience. Click the following link to view: ${process.env.FRONTEND_URL}`,
  };
  // Send the email
  try {
    await sgMail.send(mailOptions);
    console.log("Notify email sent successfully");
  } catch (error) {
    console.error("Error sending Notify email:", error);
  }
}





// Cron job for sending note notifications every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("Running 15-minute note notification check");
  const admins = await Admin.find({
    isActive: true,
    emailNotify: true,
    emailNotifyDelay: "15m",
  });
  for (const admin of admins) {
    const unreadNotes = await Notification.find({
      adminId: admin._id,
      read: false,
    });

    if (unreadNotes.length > 0) {
      sendNotifyEmailNote(admin, unreadNotes.length);
    }
  }
});

// Cron job for sending msg notifications every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("Running 15-minute note notification check");
  const admins = await Admin.find({
    isActive: true,
    emailNotify: true,
    emailNotifyDelay: "15m",
  });
  for (const admin of admins) {
    const unreadMessages = await Conversation.find({
      lastMessageSenderId: { $ne: admin._id },
      participants: {
        $in: [admin._id],
      },
      seen: false,
    });

    if (unreadMessages.length > 0) {
      sendNotifyEmailMsg(admin, unreadMessages.length);
    }
  }
});

// Cron job for sending note notifications every 60 minutes
cron.schedule("0 * * * *", async () => {
  console.log("Running 60-minute note notification check");
  const admins = await Admin.find({
    isActive: true,
    emailNotify: true,
    emailNotifyDelay: "1h",
  });
  for (const admin of admins) {
    const unreadNotes = await Notification.find({
      adminId: admin._id,
      read: false,
    });

    if (unreadNotes.length > 0) {
      sendNotifyEmailNote(admin, unreadNotes.length);
    }
  }
});

// Cron job for sending msg notifications every 60 minutes
cron.schedule("0 * * * *", async () => {
  console.log("Running 60-minute msg notification check");
  const admins = await Admin.find({
    isActive: true,
    emailNotify: true,
    emailNotifyDelay: "1h",
  });
  for (const admin of admins) {
    const unreadMessages = await Conversation.find({
      lastMessageSenderId: { $ne: admin._id },
      participants: {
        $in: [admin._id],
      },
      seen: false,
    });

    if (unreadMessages.length > 0) {
      sendNotifyEmailMsg(admin, unreadMessages.length);
    }
  }
});

