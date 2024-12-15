import { Patient } from "../models/patient.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getMetricsForOverview = asyncHandler(async (req, res) => {
  const totalPatients = await Patient.countDocuments();
  const malePatients = await Patient.countDocuments({ gender: "male" });
  const femalePatients = await Patient.countDocuments({ gender: "female" });
  const patientsAge0To25 = await Patient.countDocuments({
    age: { $gte: 0, $lte: 25 },
  });

  const patientsAge26To50 = await Patient.countDocuments({
    age: { $gte: 26, $lte: 50 },
  });

  const patientsAge51To75 = await Patient.countDocuments({
    age: { $gte: 51, $lte: 75 },
  });
  const patientsAge76To100 = await Patient.countDocuments({
    age: { $gte: 76, $lte: 100 },
  });

  const patientsAge100Plus = await Patient.countDocuments({
    age: { $gte: 101 },
  });

  // clinic wise count of patients and categorised by age

  // 0 to 25
  const patientsAge0To25OfDM = await Patient.countDocuments({
    age: { $gte: 0, $lte: 25 },
    clinic: "dm",
  });

  const patientsAge0To25OfDew = await Patient.countDocuments({
    age: { $gte: 0, $lte: 25 },
    clinic: "dew",
  });
  const patientsAge0To25OfWw = await Patient.countDocuments({
    age: { $gte: 0, $lte: 25 },
    clinic: "ww",
  });
  const patientsAge0To25OfRb = await Patient.countDocuments({
    age: { $gte: 0, $lte: 25 },
    clinic: "rb",
  });

  // Age 26 to 50
  const patientsAge26To50OfDM = await Patient.countDocuments({
    age: { $gte: 26, $lte: 50 },
    clinic: "dm",
  });

  const patientsAge26To50OfDew = await Patient.countDocuments({
    age: { $gte: 26, $lte: 50 },
    clinic: "dew",
  });

  const patientsAge26To50OfWw = await Patient.countDocuments({
    age: { $gte: 26, $lte: 50 },
    clinic: "ww",
  });

  const patientsAge26To50OfRb = await Patient.countDocuments({
    age: { $gte: 26, $lte: 50 },
    clinic: "rb",
  });

  // Age 51 to 75
  const patientsAge51To75OfDM = await Patient.countDocuments({
    age: { $gte: 51, $lte: 75 },
    clinic: "dm",
  });

  const patientsAge51To75OfDew = await Patient.countDocuments({
    age: { $gte: 51, $lte: 75 },
    clinic: "dew",
  });

  const patientsAge51To75OfWw = await Patient.countDocuments({
    age: { $gte: 51, $lte: 75 },
    clinic: "ww",
  });

  const patientsAge51To75OfRb = await Patient.countDocuments({
    age: { $gte: 51, $lte: 75 },
    clinic: "rb",
  });

  // Age 76 to 100
  const patientsAge76To100OfDM = await Patient.countDocuments({
    age: { $gte: 76, $lte: 100 },
    clinic: "dm",
  });

  const patientsAge76To100OfDew = await Patient.countDocuments({
    age: { $gte: 76, $lte: 100 },
    clinic: "dew",
  });

  const patientsAge76To100OfWw = await Patient.countDocuments({
    age: { $gte: 76, $lte: 100 },
    clinic: "ww",
  });

  const patientsAge76To100OfRb = await Patient.countDocuments({
    age: { $gte: 76, $lte: 100 },
    clinic: "rb",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPatients,
        malePatients,
        femalePatients,
        patientsAge0To25,
        patientsAge26To50,
        patientsAge51To75,
        patientsAge76To100,
        patientsAge100Plus,
        patientsAge0To25OfClinics: {
          dm: patientsAge0To25OfDM,
          dew: patientsAge0To25OfDew,
          ww: patientsAge0To25OfWw,
          rb: patientsAge0To25OfRb,
        },
        patientsAge26To50OfClinics: {
          dm: patientsAge26To50OfDM,
          dew: patientsAge26To50OfDew,
          ww: patientsAge26To50OfWw,
          rb: patientsAge26To50OfRb,
        },
        patientsAge51To75OfClinics: {
          dm: patientsAge51To75OfDM,
          dew: patientsAge51To75OfDew,
          ww: patientsAge51To75OfWw,
          rb: patientsAge51To75OfRb,
        },
        patientsAge76To100OfClinics: {
          dm: patientsAge76To100OfDM,
          dew: patientsAge76To100OfDew,
          ww: patientsAge76To100OfWw,
          rb: patientsAge76To100OfRb,
        },
      },
      "Metrics fetched successfully"
    )
  );
});

export { getMetricsForOverview };
