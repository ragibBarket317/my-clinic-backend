import mongoose, { Schema } from "mongoose";

const patientExamSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    aweStatus: {
      type: String,
      enum: ["Need to Schedule", "Refused", "Scheduled", "Completed", "none"],
      default: "none",
    },
    aweDate: {
      type: Date,
      default: null,
    },
    aweCbpSystolic: {
      type: Number,
      default: -1,
    },
    aweCbpdiastolic: {
      type: Number,
      default: -1,
    },
    phqVersion: {
      type: String,
      default: null,
    },
    awePhq2Score: {
      type: Number,
      default: -1,
    },
    awePhq2Date: {
      type: Date,
      default: null,
    },
    awePhq9Level: {
      type: String,
      enum: [
        "normal",
        "mild",
        "moderate",
        "moderately severe",
        "severe",
        "none",
      ],
      default: "none",
    },
    awePhq9Score: {
      type: Number,
      default: -1,
    },
    awePhq9Date: {
      type: Date,
      default: null,
    },
    colStatus: {
      type: String,
      enum: ["Refused", "Negative", "Positive", "Pending", "none"],
      default: "none",
    },
    colDate: {
      type: Date,
      default: null,
    },
    bcsDate: {
      type: Date,
      default: null,
    },
    acceStatus: {
      type: String,
      enum: ["Need to Schedule", "Refused", "Scheduled", "Completed", "none"],
      default: "none",
    },
    acceDate: {
      type: Date,
      default: null,
    },
    acceCbpSystolic: {
      type: Number,
      default: -1,
    },
    acceCbpdiastolic: {
      type: Number,
      default: -1,
    },
    acceFallRisk: {
      type: String,
      enum: ["≤1", "≥2", "none"],
      default: "none",
    },
    attestation: {
      type: String,
      enum: ["Required", "Not Needed", "none"],
      default: "none",
    },
    hosper: {
      type: String,
      enum: ["Required ASAP", "Not Needed", "none"],
      default: "none",
    },
    hosperCreationDate: {
      type: Date,
      default: null,
    },
    eyeStatus: {
      type: String,
      enum: [
        "Need to Schedule",
        "Refused",
        "Scheduled",
        "Completed",
        "Not Applicable",
        "none",
      ],
      default: "none",
    },
    eyeDate: {
      type: Date,
      default: null,
    },
    eyeResults: {
      type: String,
      enum: ["with retinopathy", "w/o retinopathy", "none"],
      default: "none",
    },
    footStatus: {
      type: String,
      enum: [
        "Need to Schedule",
        "Refused",
        "Scheduled",
        "Completed",
        "Not Applicable",
        "none",
      ],
      default: "none",
    },
    footDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const PatientExam = mongoose.model("PatientExam", patientExamSchema);

export default PatientExam;
