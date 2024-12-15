import mongoose, { Schema } from "mongoose";

const labsDataSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    QTR1: {
      type: Number,
      default: -1,
    },
    QTR1Date: {
      type: Date,
      default: null,
    },
    QTR2: {
      type: Number,
      default: -1,
    },
    QTR2Date: {
      type: Date,
      default: null,
    },
    QTR3: {
      type: Number,
      default: -1,
    },
    QTR3Date: {
      type: Date,
      default: null,
    },
    QTR4: {
      type: Number,
      default: -1,
    },
    QTR4Date: {
      type: Date,
      default: null,
    },
    eGRFDate: {
      type: Date,
      default: null,
    },
    uACRDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const LabsData = mongoose.model("LabsData", labsDataSchema);
