import mongoose, { Schema } from "mongoose";

const medicalHistorySchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    risk: {
      type: String,
      enum: ["Low", "High"],
    },
    statins: {
      type: String,
      enum: ["Yes", "Non-Compliant", "Allergic", "Not Applicable"],
    },
    dm2: {
      type: String,
      enum: ["Yes", "No", "PreDM2"],
    },
    tobaccoUse: {
      type: String,
      enum: ["Yes", "No"],
    },
    dexa: {
      type: String,
      enum: ["Required", "Not Required"],
    },
    bmi: {
      type: Number,
    },
    bmiDate: {
      type: Date,
      default: null,
    },
    chronicConditions: {
      type: String,
      enum: ["Yes", "No"],
    },
  },
  { timestamps: true }
);

export const MedicalHistory = mongoose.model(
  "MedicalHistory",
  medicalHistorySchema
);
