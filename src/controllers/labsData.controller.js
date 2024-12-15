import { LabsData } from "../models/labsData.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addLabsData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    QTR1,
    QTR1Date,
    QTR2,
    QTR2Date,
    QTR3,
    QTR3Date,
    QTR4,
    QTR4Date,
    eGRFDate,
    uACRDate,
  } = req.body;

  // Filter out fields that are not provided
  const newData = {
    patientId: id,
    QTR1,
    QTR1Date,
    QTR2,
    QTR2Date,
    QTR3,
    QTR3Date,
    QTR4,
    QTR4Date,
    eGRFDate,
    uACRDate,
  };
  // Remove fields with undefined values
  Object.keys(newData).forEach(
    (key) => newData[key] === undefined && delete newData[key]
  );
  // Create new labs data
  const newLabsData = await LabsData.create(newData);

  // check for user creation
  if (!newLabsData) {
    throw new ApiError(
      500,
      `'Something went wrong while creating the Labs Data for patientId ${patientId}`
    );
  }
  return res
    .status(201)
    .json(new ApiResponse(200, newLabsData, "Labs Data created successfully"));
});

/////// patch function to update patients medical history///////

const updateLabsData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    QTR1,
    QTR1Date,
    QTR2,
    QTR2Date,
    QTR3,
    QTR3Date,
    QTR4,
    QTR4Date,
    eGRFDate,
    uACRDate,
  } = req.body;

  // Filter out fields that are not provided
  const newData = {
    QTR1,
    QTR1Date,
    QTR2,
    QTR2Date,
    QTR3,
    QTR3Date,
    QTR4,
    QTR4Date,
    eGRFDate,
    uACRDate,
  };
  // Remove fields with undefined values
  Object.keys(newData).forEach(
    (key) => newData[key] === undefined && delete newData[key]
  );
  // Find the labs data by patients ID and update
  const updatedLabsData = await LabsData.findOneAndUpdate(
    { patientId: id },
    newData,
    { new: true, runValidators: true }
  );

  // Check if labs data was found and updated
  if (!updatedLabsData) {
    throw new ApiError(404, `Labs data with ID ${id} not found`);
  }

  // Return success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedLabsData, "Labs data updated successfully")
    );
});

// check labs exists for a patient
const checkLabs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Check if medical history exists for the given patientId
  const labsExists = await LabsData.exists({ patientId: id });

  // Return true if medical history exists, false otherwise
  if (labsExists) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { exists: true },
          "Lab data exists for this patient"
        )
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { exists: false },
          "Lab data doesn't exists for this patient"
        )
      );
  }
});

export { addLabsData, updateLabsData, checkLabs };
