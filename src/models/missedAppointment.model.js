import mongoose, { Schema } from "mongoose";

const missedAppointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    patientName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    clinic: {
      type: String,
      required: true,
    },
    appointmentFor: {
      type: String,
      required: true,
    },
    appointmentDueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const MissedAppointment = mongoose.model(
  "MissedAppointment",
  missedAppointmentSchema
);
