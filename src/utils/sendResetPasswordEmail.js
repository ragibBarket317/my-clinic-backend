// import nodemailer from "nodemailer";

// async function sendResetPasswordEmail(email, token) {
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
//     subject: "Reset Password",
//     text: `You are receiving this email because a password reset request has been made for your account.
//       Please click on the following link, or paste it into your browser to complete the process:
//        ${process.env.FRONTEND_URL}/reset-password?token=${token}
//        If you did not request this, please ignore this email and your password will remain unchanged.`,
//   };

//   // Send the email
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Reset Password email sent successfully");
//   } catch (error) {
//     console.error("Error sending Reset Password email:", error);
//     throw new Error("Failed to send Reset Password email");
//   }
// }

import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendResetPasswordEmail(email, token) {
  // create the msg body
  const mailOptions = {
    from: process.env.SENDGRID_EMAIL,
    to: email,
    subject: "Reset Password",
    text: `You are receiving this email because a password reset request has been made for your account.
      Please click on the following link, or paste it into your browser to complete the process:
       ${process.env.FRONTEND_URL}/reset-password?token=${token}
       If you did not request this, please ignore this email and your password will remain unchanged.`,
  };

  // Send the email
  try {
    await sgMail.send(mailOptions);
    console.log("Reset Password email sent successfully for ", email);
  } catch (error) {
    console.error("Error sending Reset Password email:", error);
    throw new Error("Failed to send Reset Password email");
  }
}

export { sendResetPasswordEmail };
