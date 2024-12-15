import PatientExam from "../models/patientExam.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addPatientExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    aweStatus,
    aweDate,
    aweCbpSystolic,
    aweCbpdiastolic,
    phqVersion,
    awePhq2Score,
    awePhq2Date,
    awePhq9Level,
    awePhq9Score,
    awePhq9Date,
    colStatus,
    colDate,
    bcsDate,
    acceStatus,
    acceDate,
    acceCbpSystolic,
    acceCbpdiastolic,
    acceFallRisk,
    attestation,
    hosper,
    eyeStatus,
    eyeDate,
    eyeResults,
    footStatus,
    footDate,
  } = req.body;

  // Check if any required field is missing
  if (!id) {
    throw new ApiError(400, "Patient ID is required");
  }
  // Filter out fields that are not provided
  const newData = {
    patientId: id,
    aweStatus,
    aweDate,
    aweCbpSystolic,
    aweCbpdiastolic,
    phqVersion,
    awePhq2Score,
    awePhq2Date,
    awePhq9Level,
    awePhq9Score,
    awePhq9Date,
    colStatus,
    colDate,
    bcsDate,
    acceStatus,
    acceDate,
    acceCbpSystolic,
    acceCbpdiastolic,
    acceFallRisk,
    attestation,
    hosper,
    hosperCreationDate: hosper === "Required ASAP" ? new Date() : null,
    eyeStatus,
    eyeDate,
    eyeResults,
    footStatus,
    footDate,
  };
  // Remove fields with undefined values
  Object.keys(newData).forEach(
    (key) => newData[key] === undefined && delete newData[key]
  );

  // Create new patient exam
  const newPatientExam = await PatientExam.create(newData);

  // Check for patient exam creation
  if (!newPatientExam) {
    throw new ApiError(
      500,
      `Something went wrong while creating the patient exam for patientId ${id}`
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, newPatientExam, "Patient Exam created Successfully")
    );
});

/////// patch function to update patients exam///////

const updatePatientExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patientsExamData = await PatientExam.findOne({ patientId: id });
  const {
    aweStatus,
    aweDate,
    aweCbpSystolic,
    aweCbpdiastolic,
    phqVersion,
    awePhq2Score,
    awePhq2Date,
    awePhq9Level,
    awePhq9Score,
    awePhq9Date,
    colStatus,
    colDate,
    bcsDate,
    acceStatus,
    acceDate,
    acceCbpSystolic,
    acceCbpdiastolic,
    acceFallRisk,
    attestation,
    hosper,
    eyeStatus,
    eyeDate,
    eyeResults,
    footStatus,
    footDate,
  } = req.body;

  // Filter out fields that are not provided
  const newData = {
    aweStatus,
    aweDate,
    aweCbpSystolic,
    aweCbpdiastolic,
    phqVersion,
    awePhq2Score,
    awePhq2Date,
    awePhq9Level,
    awePhq9Score,
    awePhq9Date,
    colStatus,
    colDate,
    bcsDate,
    acceStatus,
    acceDate,
    acceCbpSystolic,
    acceCbpdiastolic,
    acceFallRisk,
    attestation,
    hosper,
    hosperCreationDate:
      hosper == "Required ASAP" && patientsExamData.hosperCreationDate === null
        ? new Date()
        : patientsExamData.hosperCreationDate,
    eyeStatus,
    eyeDate,
    eyeResults,
    footStatus,
    footDate,
  };

  // Remove fields with undefined values
  Object.keys(newData).forEach(
    (key) => newData[key] === undefined && delete newData[key]
  );
  // Find the labs data by patients ID and update
  const updatedPatientExam = await PatientExam.findOneAndUpdate(
    { patientId: id },
    newData,
    { new: true, runValidators: true }
  );

  // Check if labs data was found and updated
  if (!updatedPatientExam) {
    throw new ApiError(404, `Labs data with ID ${id} not found`);
  }

  // Return success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPatientExam, "Labs data updated successfully")
    );
});

// check medical history exists for a patient
const checkPatientExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Check if medical history exists for the given patientId
  const patientExamExists = await PatientExam.exists({ patientId: id });

  // Return true if medical history exists, false otherwise
  if (patientExamExists) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { exists: true },
          "patient exam data exists for this patient"
        )
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { exists: false },
          "patient exam data doesn't exists for this patient"
        )
      );
  }
});

export { addPatientExam, updatePatientExam, checkPatientExam };
