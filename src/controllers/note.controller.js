import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
import { io } from "../app.js";
import { Admin } from "../models/admin.model.js";
import { Note } from "../models/note.model.js";
import { Notification } from "../models/notification.model.js";
import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
async function sendNotifyEmail(admin) {
  // create the msg body
  const mailOptions = {
    to: admin.email,
    from: process.env.SENDGRID_EMAIL,
    subject: "New Note Added - MyClinic",
    text: `Hi ${admin.fullName}, We wanted to let you know that a new note has been added. Please review it at your earliest convenience Click the following link to view: ${process.env.FRONTEND_URL}.`,
  };
  // Send the email
  try {
    console.log("Note Notify email sending...");

    await sgMail.send(mailOptions);
    console.log("Notify email sent successfully");
  } catch (error) {
    console.error("Error sending Notify email:", error);
  }
}

// Create a new note
const addNote = asyncHandler(async (req, res) => {
  const { patientId, title, description } = req.body;
  const creatorId = req.admin._id;

  if (
    [patientId, title].some(
      (field) => typeof field === "string" && field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const newNote = await Note.create({
    patientId,
    creatorId,
    title,
    description,
  });
  if (!newNote) {
    throw new ApiError(500, "Failed to create note");
  }

  // Find admins for creating notifications
  // const relevantAdmins = await Admin.find({
  //   _id: { $ne: creatorId },
  // });
  const relevantAdmins = await Admin.find();
  const patient = await Patient.findById(newNote.patientId);
  // Create a notification for each relevant admin
  relevantAdmins.forEach(async (admin) => {
    await Notification.create({
      patientId,
      content:
        "A new note has been added for " +
        `${patient.firstName} ${patient.lastName}: ${newNote.title}`,
      adminId: admin._id,
      noteId: newNote._id,
      fullName: `${patient.firstName} ${patient.lastName}`,
    });

    // send notification email to admin based on the admin's emailNotify and emailNotifyDelay settings
    if (admin.emailNotify && admin.emailNotifyDelay === "Immediately") {
      sendNotifyEmail(admin);
    } else if (admin.emailNotify && admin.emailNotifyDelay === "15m") {
      setTimeout(
        () => {
          sendNotifyEmail(admin);
        },
        15 * 60 * 1000
      );
    } else if (admin.emailNotify && admin.emailNotifyDelay === "1h") {
      setTimeout(
        () => {
          sendNotifyEmail(admin);
        },
        60 * 60 * 1000
      );
    }
  });

  // Emiting the socket event when a note is added
  io.emit("noteAdded", {
    patientName: `${patient.firstName} ${patient.lastName}`,
  });

  res
    .status(201)
    .json(new ApiResponse(200, newNote, "Note created successfully"));
});

// Update a note by ID
const updateNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const updatedNote = await Note.findByIdAndUpdate(
    noteId,
    { title, description },
    { new: true }
  );

  if (!updatedNote) {
    throw new ApiError(404, "Note not found");
  }

  return res.json(
    new ApiResponse(200, updatedNote, "Note updated successfully")
  );
});

// Toggle the resolved status of a note by ID
const toggleNoteResolved = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  // Find the note by ID
  const note = await Note.findById(noteId);

  // If note doesn't exist, return 404 error
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  // Toggle the resolved status
  note.resolved = !note.resolved;

  // Save the updated note
  const newNote = await note.save();

  if (newNote.resolved) {
    // Find admins for creating notifications
    const relevantAdmins = await Admin.find({
      _id: { $ne: newNote.creatorId },
    });

    const patient = await Patient.findById(newNote.patientId);
    // Create a notification for each relevant admin
    relevantAdmins.forEach(async (admin) => {
      await Notification.create({
        patientId: newNote.patientId,
        content:
          "A note has been marked Resolved for " +
          `${patient.firstName} ${patient.lastName}: ${newNote.title}`,
        adminId: admin._id,
        noteId: newNote._id,
        fullName: `${patient.firstName} ${patient.lastName}`,
      });
    });

    // Emiting the socket event when a note is added
    io.emit("noteResolved", {
      patientId: newNote.patientId,
    });
  }

  // Respond with the updated note
  return res.json(
    new ApiResponse(200, note, "Note resolved status toggled successfully")
  );
});

// Delete a note by ID
const deleteNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;

  const deletedNote = await Note.findByIdAndDelete(noteId);

  // delete the notifications associated with the note
  await Notification.deleteMany({ noteId });

  if (!deletedNote) {
    throw new ApiError(404, "Note not found");
  }

  return res.status(204).end();
});

export { addNote, deleteNote, toggleNoteResolved, updateNote };
