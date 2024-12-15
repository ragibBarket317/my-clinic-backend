import { MedicalHistory } from "../models/medicalHistoy.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addMedicalHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { risk, statins, dm2, tobaccoUse, dexa, bmi, chronicConditions } =
    req.body;
  // if (
  //   [id, risk, statins, dm2, tobaccoUse, dexa].some(
  //     (field) => field?.trim() === ""
  //   )
  // ) {
  //   throw new ApiError(400, "All fields are required");
  // }
  // Create new medical history
  const newMedicalHistory = await MedicalHistory.create({
    patientId: id,
    risk,
    statins,
    dm2,
    tobaccoUse,
    dexa,
    bmiDate: bmi ? new Date() : null,
    bmi,
    chronicConditions,
  });

  // check for user creation
  if (!newMedicalHistory) {
    throw new ApiError(
      500,
      `Something went wrong while creating the medical history for patientId ${patientId}`
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        newMedicalHistory,
        "Medical History created Successfully"
      )
    );
});

// patch function to update patients medical history
const updateMedicalHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { risk, statins, dm2, tobaccoUse, dexa, bmi, chronicConditions } =
    req.body;

  // Validate request body
  if (
    [risk, statins, dm2, tobaccoUse, dexa].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Find the medical history by ID and update
  const updatedMedicalHistory = await MedicalHistory.findOneAndUpdate(
    { patientId: id },
    {
      risk,
      statins,
      dm2,
      tobaccoUse,
      dexa,
      bmi,
      chronicConditions,
      bmiDate: bmi ? new Date() : null,
    },
    { new: true, runValidators: true }
  );

  // Check if medical history was found and updated
  if (!updatedMedicalHistory) {
    throw new ApiError(404, `Medical history with ID ${id} not found`);
  }

  // Return success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedMedicalHistory,
        "Medical history updated successfully"
      )
    );
});

// check medical history exists for a patient
const checkMedicalHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Check if medical history exists for the given patientId
  const medicalHistoryExists = await MedicalHistory.exists({ patientId: id });

  // Return true if medical history exists, false otherwise
  if (medicalHistoryExists) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { exists: true },
          "Medical History exists for this patient"
        )
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { exists: false },
          "Medical History doesn't exists for this patient"
        )
      );
  }
});

export { addMedicalHistory, updateMedicalHistory, checkMedicalHistory };
