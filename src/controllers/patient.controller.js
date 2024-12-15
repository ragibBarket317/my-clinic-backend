import mongoose from "mongoose";
import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { LabsData } from "../models/labsData.model.js";
import { MedicalHistory } from "../models/medicalHistoy.model.js";
import PatientExam from "../models/patientExam.models.js";

const addPatient = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    clinic,
    plan,
    benefityear,
    gender,
    accountNumber,
    age,
  } = req.body;
  if (
    [
      firstName,
      lastName,
      dob,
      clinic,
      plan,
      benefityear,
      gender,
      accountNumber,
      age,
    ].some(
      (field) =>
        (typeof field === "string" && field.trim() === "") ||
        (typeof field === "number" && isNaN(field))
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if the account number already exists
  const existingAccountNumber = await Patient.findOne({ accountNumber });
  if (existingAccountNumber) {
    throw new ApiError(400, "Account number already exists");
  }

  const patient = new Patient({
    firstName,
    lastName,
    dob,
    clinic,
    plan,
    benefityear,
    gender,
    accountNumber,
    age,
  });
  await patient.save();

  return res.status(201).json({
    success: true,
    data: patient,
    message: "Patient added successfully",
  });
});

const getAllPatients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  const filters = {};

  // Extracting filters from query parameters
  if (req.query.gender) filters.gender = { $in: req.query.gender.split(",") };
  if (req.query.clinic) filters.clinic = { $in: req.query.clinic.split(",") };
  if (req.query.plan) filters.plan = { $in: req.query.plan.split(",") };
  if (req.query.benefityear)
    filters.benefityear = {
      $in: req.query.benefityear
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };
  // aweStatus filter on patientExam collection
  if (req.query.awestatus)
    filters["exams.aweStatus"] = {
      $in: req.query.awestatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // acceStatus filter on patientExam collection
  if (req.query.accestatus)
    filters["exams.acceStatus"] = {
      $in: req.query.accestatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // eyeStatus filter on patientExam collection
  if (req.query.eyestatus)
    filters["exams.eyeStatus"] = {
      $in: req.query.eyestatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // footStatus filter on patientExam collection
  if (req.query.footstatus)
    filters["exams.footStatus"] = {
      $in: req.query.footstatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // Extracting text from request body
  if (req.body.searchText) {
    const searchText = req?.body?.searchText?.trim();
    const nameParts = searchText.split(/\s+/).filter((part) => part);
    const nameFilters = [];
    const dobRegex = /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/;

    // Check if searchText matches date of birth format
    if (dobRegex.test(searchText)) {
      // If it's a date of birth, parse and construct filter
      const [, month, day, year] = searchText.match(dobRegex);
      filters.day = parseInt(day);
      filters.month = parseInt(month);
      filters.year = parseInt(year);
    } else {
      // If it's not a date of birth, construct name or account number filters
      nameParts.forEach((part) => {
        const trimmedPart = part.trim();
        nameFilters.push({
          firstName: new RegExp(trimmedPart, "i"),
        });
        nameFilters.push({
          lastName: new RegExp(trimmedPart, "i"),
        });
        nameFilters.push({
          accountNumber: new RegExp(trimmedPart, "i"),
        });
      });

      filters.$or = nameFilters;
    }
  }

  const pipeline = [
    {
      $lookup: {
        from: "patientexams", // Name of the collection
        localField: "_id",
        foreignField: "patientId",
        as: "exams",
      },
    },
    {
      $addFields: {
        month: {
          $month: "$dob",
        },
        day: {
          $toInt: {
            $substr: [{ $dateToString: { format: "%d", date: "$dob" } }, 0, 2],
          },
        },
        year: {
          $year: "$dob",
        },
      },
    },
    { $match: filters },
    {
      $project: {
        exams: 0,
        month: 0,
        day: 0,
        year: 0,
      },
    },
    {
      $facet: {
        totalCount: [
          { $count: "totalDocuments" }, // Count all documents matching the filters
        ],
        patients: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const patients = await Patient.aggregate(pipeline);
  const totalCount = patients[0].totalCount[0]?.totalDocuments || 0;
  const totalPages = Math.ceil(totalCount / limit);
  // console.log("hit", req.query.page);
  return res.status(200).json({
    success: true,
    data: {
      totalPatients: totalCount,
      totalPages,
      currentPage: page,
      patients: patients[0].patients,
    },
  });
});

// get All Patient for excel feature without pagination
const getAllPatientsForExcel = asyncHandler(async (req, res) => {
  const filters = {};

  // Extracting filters from query parameters
  if (req.query.gender) filters.gender = { $in: req.query.gender.split(",") };
  if (req.query.clinic) filters.clinic = { $in: req.query.clinic.split(",") };
  if (req.query.plan) filters.plan = { $in: req.query.plan.split(",") };
  if (req.query.benefityear)
    filters.benefityear = {
      $in: req.query.benefityear
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };
  // aweStatus filter on patientExam collection
  if (req.query.awestatus)
    filters["exams.aweStatus"] = {
      $in: req.query.awestatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // acceStatus filter on patientExam collection
  if (req.query.accestatus)
    filters["exams.acceStatus"] = {
      $in: req.query.accestatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // eyeStatus filter on patientExam collection
  if (req.query.eyestatus)
    filters["exams.eyeStatus"] = {
      $in: req.query.eyestatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // footStatus filter on patientExam collection
  if (req.query.footstatus)
    filters["exams.footStatus"] = {
      $in: req.query.footstatus
        .split(",")
        .map((value) => decodeURIComponent(value)),
    };

  // Extracting text from request body
  if (req.body.searchText) {
    const searchText = req?.body?.searchText?.trim();
    const nameParts = searchText.split(/\s+/).filter((part) => part);
    const nameFilters = [];
    const dobRegex = /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/;

    // Check if searchText matches date of birth format
    if (dobRegex.test(searchText)) {
      // If it's a date of birth, parse and construct filter
      const [, month, day, year] = searchText.match(dobRegex);
      filters.day = parseInt(day);
      filters.month = parseInt(month);
      filters.year = parseInt(year);
    } else {
      // If it's not a date of birth, construct name or account number filters
      nameParts.forEach((part) => {
        const trimmedPart = part.trim();
        nameFilters.push({
          firstName: new RegExp(trimmedPart, "i"),
        });
        nameFilters.push({
          lastName: new RegExp(trimmedPart, "i"),
        });
        nameFilters.push({
          accountNumber: new RegExp(trimmedPart, "i"),
        });
      });

      filters.$or = nameFilters;
    }
  }

  const pipeline = [
    {
      $lookup: {
        from: "patientexams", // Name of the collection
        localField: "_id",
        foreignField: "patientId",
        as: "exams",
      },
    },
    {
      $addFields: {
        month: {
          $month: "$dob",
        },
        day: {
          $toInt: {
            $substr: [{ $dateToString: { format: "%d", date: "$dob" } }, 0, 2],
          },
        },
        year: {
          $year: "$dob",
        },
      },
    },
    { $match: filters },
    {
      $project: {
        exams: 0,
        month: 0,
        day: 0,
        year: 0,
      },
    },
  ];

  const patients = await Patient.aggregate(pipeline);
  return res.status(200).json({
    success: true,
    data: {
      patients: patients,
    },
  });
});

const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid patient ID");
  }
  const {
    firstName,
    lastName,
    dob,
    clinic,
    plan,
    benefityear,
    gender,
    accountNumber,
    age,
  } = req.body;
  if (
    [
      firstName,
      lastName,
      dob,
      clinic,
      plan,
      benefityear,
      gender,
      accountNumber,
      age,
    ].some(
      (field) =>
        (typeof field === "string" && field.trim() === "") ||
        (typeof field === "number" && isNaN(field))
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const patient = await Patient.findByIdAndUpdate(
    id,
    {
      firstName,
      lastName,
      dob,
      clinic,
      plan,
      benefityear,
      gender,
      accountNumber,
      age,
    },
    { new: true, rawResult: true }
  );
  const responseOfPatient = await Patient.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "notes",
        localField: "_id",
        foreignField: "patientId",
        as: "notes",
      },
    },
    {
      $addFields: {
        openedNotes: {
          $filter: {
            input: "$notes",
            as: "note",
            cond: { $eq: ["$$note.resolved", false] },
          },
        },
        resolvedNotes: {
          $filter: {
            input: "$notes",
            as: "note",
            cond: { $eq: ["$$note.resolved", true] },
          },
        },
      },
    },
    {
      $project: {
        notes: 0,
      },
    },
  ]);
  if (!responseOfPatient) {
    throw new ApiError(404, "Patient not found");
  }

  return res.status(200).json({
    success: true,
    data: responseOfPatient[0],
    message: "Patient updated successfully",
  });
});

const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid patient ID");
  }
  // const patient = await Patient.findByIdAndDelete(id);
  // Find and delete patient
  const [patient] = await Promise.all([
    Patient.findByIdAndDelete(id),
    MedicalHistory.findOneAndDelete({ patientId: id }),
    LabsData.findOneAndDelete({ patientId: id }),
    PatientExam.findOneAndDelete({ patientId: id }),
  ]);

  if (!patient || patient.value === null) {
    throw new ApiError(404, "Patient not found");
  }

  return res.status(200).json({
    success: true,
    message: "Patient deleted successfully",
  });
});

const getPatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  const patient = await Patient.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "medicalhistories",
        localField: "_id",
        foreignField: "patientId",
        as: "medicalHistories",
      },
    },
    {
      $lookup: {
        from: "labsdatas",
        localField: "_id",
        foreignField: "patientId",
        as: "labsDatas",
      },
    },
    {
      $lookup: {
        from: "patientexams",
        localField: "_id",
        foreignField: "patientId",
        as: "patientExams",
      },
    },
    {
      $lookup: {
        from: "notes",
        localField: "_id",
        foreignField: "patientId",
        as: "notes",
      },
    },
    {
      $addFields: {
        medicalHistories: {
          $arrayElemAt: ["$medicalHistories", 0],
        },
        labsDatas: {
          $arrayElemAt: ["$labsDatas", 0],
        },
        patientExams: {
          $arrayElemAt: ["$patientExams", 0],
        },
      },
    },
    {
      $addFields: {
        openedNotes: {
          $filter: {
            input: "$notes",
            as: "note",
            cond: { $eq: ["$$note.resolved", false] },
          },
        },
        resolvedNotes: {
          $filter: {
            input: "$notes",
            as: "note",
            cond: { $eq: ["$$note.resolved", true] },
          },
        },
      },
    },
    {
      $project: {
        notes: 0,
      },
    },
  ]);

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }
  return res.status(200).json({
    success: true,
    data: patient[0],
  });
});

export {
  addPatient,
  deletePatient,
  getAllPatients,
  getPatient,
  updatePatient,
  getAllPatientsForExcel,
};
