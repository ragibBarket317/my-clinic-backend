import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    plan: {
      type: String,
      enum: [
        "self-pay",
        "membership",
        "commercial",
        "medicare-advantage",
        "medicare-traditional",
      ],
      required: true,
    },
    clinic: {
      type: String,
      enum: ["dew", "ww", "rb", "dm"],
      required: true,
    },
    benefityear: {
      type: String,
      enum: ["jan-dec", "365+1 days"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Patient = mongoose.model("Patient", patientSchema);
