// import nodemailer from "nodemailer";

// async function sendInvitationEmail(email, token, role) {
//   // Create a Nodemailer transporter for Gmail
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_ADDRESS, // Your Gmail email address
//       pass: process.env.EMAIL_PASSWORD, // Your Gmail password or App Password
//     },
//   });

//   // Configure the email options
//   const mailOptions = {
//     from: process.env.EMAIL_ADDRESS,
//     to: email,
//     subject: "Invitation to register",
//     text: `You are invited to register as ${role}. Click the following link to register: ${process.env.FRONTEND_URL}/register?token=${token}`,
//   };

//   // Send the email
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Invitation email sent successfully");
//   } catch (error) {
//     console.error("Error sending invitation email:", error);
//     throw new Error("Failed to send invitation email");
//   }
// }

// export { sendInvitationEmail };

import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendInvitationEmail(email, token, role) {
  // create the msg body
  const mailOptions = {
    to: email,
    from: process.env.SENDGRID_EMAIL,
    subject: "Invitation to register",
    text: `You are invited to register as ${role}. Click the following link to register: ${process.env.FRONTEND_URL}/register?token=${token}`,
  };

  // Send the email
  try {
    await sgMail.send(mailOptions);
    console.log("Invitation email sent successfully");
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw new Error("Failed to send invitation email");
  }
}

export { sendInvitationEmail };
