import { MedicalHistory } from "../models/medicalHistoy.model.js";
import { Patient } from "../models/patient.model.js";
import PatientExam from "../models/patientExam.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllAppointments = asyncHandler(async (req, res) => {
  const patientExams = await PatientExam.find({
    $or: [{ aweStatus: "Scheduled" }, { acceStatus: "Scheduled" }],
  }).populate("patientId");

  const appointments = [];

  patientExams.forEach((exam) => {
    if (exam.aweStatus === "Scheduled") {
      appointments.push({
        patientId: exam.patientId._id,
        patientName: `${exam.patientId.firstName} ${exam.patientId.lastName}`,
        date: exam.aweDate,
        examName: "AWE",
      });
    }

    if (exam.acceStatus === "Scheduled") {
      appointments.push({
        patientId: exam.patientId._id,
        patientName: `${exam.patientId.firstName} ${exam.patientId.lastName}`,
        date: exam.acceDate,
        examName: "ACCE",
      });
    }
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
      },
      "all appoinments fetched successfully"
    )
  );
});

/**
 * Controller function to get the number and percentage of overdue AWE (Annual Wellness Exam) and ACCE
 * (Annual Comprehensive Clinical Exam) patients for each clinic. Overdue is defined as:
 *  - AWE: If there is no aweDate, or if the aweDate has passed (i.e., it's before the current date).
 *  - ACCE: If the patient is diabetic (dm2 == "Yes") or aged over 65, and there is no acceDate, or the
 *    acceStatus is "Need to Schedule", or the acceDate has passed.
 *
 * The percentage is calculated with respect to the total number of patients in each clinic.
 *
 * The function iterates through each clinic in the `clinics` array, finds all patients for that clinic,
 * and then finds all exams and medical histories for those patients. It filters out the overdue exams
 * based on the defined criteria and calculates the percentage of overdue exams relative to the total
 * number of patients.
 *
 * The results are returned in a JSON format with the clinic code as the key, and the number and
 * percentage of overdue AWE and ACCE patients as the values.
 *
 * Example response structure:
 * {
 *   "dew": {
 *     "aweOverdueCount": 5,
 *     "aweIncompletePercentage": "10.00",
 *     "acceOverdueCount": 3,
 *     "acceIncompletePercentage": "6.00"
 *   },
 *   "ww": {
 *     ...
 *   },
 *   ...
 * }
 */

const getOverdueAptsAnalytics = asyncHandler(async (req, res) => {
  const clinics = ["dew", "ww", "rb", "dm"];

  let results = {};

  for (const clinic of clinics) {
    // Find all patients for the current clinic
    const patients = await Patient.find({ clinic });

    // Extract patient IDs
    const patientIds = patients.map((patient) => patient._id);

    // Find exams for the current clinic's patients
    const patientExams = await PatientExam.find({
      patientId: { $in: patientIds },
    });
    // Find medical Histories for the current clinic's patients

    const medicalHistory = await MedicalHistory.find({
      patientId: { $in: patientIds },
    });

    // Create a map of patient exams for easier access
    const patientExamMap = new Map(
      patientExams.map((exam) => [exam.patientId.toString(), exam])
    );
    // Create a map of patient medical histories for easier access

    const patientMedicalHistoryMap = new Map(
      medicalHistory.map((medicalHistory) => [
        medicalHistory.patientId.toString(),
        medicalHistory,
      ])
    );

    let aweOverdueCount = 0;
    let acceOverdueCount = 0;

    let totalCount = patients.length;
    let missedPatientsListAWE = [];
    let missedPatientsListACCE = [];

    // Iterate through patients to check for overdue exams
    for (const patient of patients) {
      const exam = patientExamMap.get(patient._id.toString());

      const medicalHistories = patientMedicalHistoryMap.get(
        patient._id.toString()
      );

      // Check if the patient has no exam record or check if the exam has no aweDate or if the aweDate has passed
      if (!exam || !exam.aweDate || exam.aweDate < new Date()) {
        aweOverdueCount++;
        missedPatientsListAWE.push({
          patientId: patient._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          aptDueDate: exam?.aweDate ? exam.aweDate : "NA",
          dob: patient.dob,
          aptStatus: exam?.aweStatus ? exam.aweStatus : "NA",
        });
      }

      // Check if patient is diabetic or age is more than 50 years  and if the patient has an exam record or check if the exam has an acceDate or if the acceDate has passed
      if (
        medicalHistories?.dm2 == "Yes" ||
        medicalHistories?.chronicConditions === "Yes" ||
        (patient.age > 65 &&
          (!exam ||
            !exam.acceDate ||
            exam.acceStatus == "Need to Schedule" ||
            exam.acceDate < new Date()))
      ) {
        acceOverdueCount++;
        missedPatientsListACCE.push({
          patientId: patient._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          aptDueDate: exam?.acceDate ? exam.acceDate : "NA",
          dob: patient.dob,
          aptStatus: exam?.acceStatus ? exam.acceStatus : "NA",
        });
      }
    }

    // Calculate the percentage
    const aweIncompletePercentage =
      totalCount > 0 ? (aweOverdueCount / totalCount) * 100 : 0;

    const acceIncompletePercentage =
      totalCount > 0 ? (acceOverdueCount / totalCount) * 100 : 0;

    results[clinic] = {
      aweOverdueCount,
      patients: missedPatientsListAWE,
      aweIncompletePercentage: aweIncompletePercentage.toFixed(2),
      acceOverdueCount,
      missedPatientsListACCE: missedPatientsListACCE,
      acceIncompletePercentage: acceIncompletePercentage.toFixed(2),
    };
  }

  res.status(200).json(
    new ApiResponse(200, {
      results: [results],
    })
  );
});

/**
 * Controller function to get the counts of patient exams based on specific conditions, individually for each clinic:
 * - HOSP/ER FU status is marked as "Required ASAP"
 * - Attestation status is marked as "Required"
 * - Eye status is marked as "Need to Schedule" or "Refused"
 * - Foot status is marked as "Need to Schedule" or "Refused"
 *
 * The function performs the following steps:
 * 1. Defines the conditions for each status.
 * 2. Initializes a counts object to store the counts for each condition per clinic, ensuring all clinics are included with initial zero counts.
 * 3. Fetches all patient exams from the database and populates the associated patient information.
 * 4. Iterates over each patient exam and updates the counts based on the specified conditions and the clinic the patient belongs to.
 * 5. Ensures that each clinic is represented in the counts object, even if no patient exams are found for that clinic.
 * 6. Returns the counts in the response.
 *
 * Example response structure:
 * {
 *   "counts": {
 *     "dew": {
 *       "hosperRequiredASAP": 0,
 *       "attestationRequired": 0,
 *       "eyeStatusNeedToScheduleOrRefused": 0,
 *       "footStatusNeedToScheduleOrRefused": 0
 *     },
 *     "ww": {
 *       "hosperRequiredASAP": 10,
 *       "attestationRequired": 5,
 *       "eyeStatusNeedToScheduleOrRefused": 8,
 *       "footStatusNeedToScheduleOrRefused": 7
 *     },
 *     ...
 *   }
 * }
 */

const getSpecialStatusCounts = asyncHandler(async (req, res) => {
  // Define the conditions for each status
  const conditions = {
    hosper: "Required ASAP",
    attestation: "Required",
    eyeStatus: ["Need to Schedule", "Refused"],
    footStatus: ["Need to Schedule", "Refused"],
  };

  // Initialize counts object with all clinics
  const clinics = ["dew", "ww", "rb", "dm"];
  let counts = clinics.reduce((acc, clinic) => {
    acc[clinic] = {
      hosperRequiredASAP: 0,
      hosperRequiredASAPPatientList: [],
      attestationRequired: 0,
      attestationRequiredPatientList: [],
      eyeStatusNeedToScheduleOrRefused: 0,
      eyeStatusNeedToScheduleOrRefusedPatientList: [],
      footStatusNeedToScheduleOrRefused: 0,
      footStatusNeedToScheduleOrRefusedPatientList: [],
    };
    return acc;
  }, {});

  // Fetch all patient exams
  const patientExams = await PatientExam.find().populate("patientId");

  // Iterate over each patient exam and update counts based on conditions
  for (const exam of patientExams) {
    const clinic = exam?.patientId?.clinic;

    if (clinic && counts[clinic]) {
      if (exam?.hosper === conditions?.hosper) {
        const hosperCreationDate = new Date(exam?.hosperCreationDate);
        const now = new Date();
        const timeDifference = now - hosperCreationDate;
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24); // Convert milliseconds to days
        console.log(daysDifference);
        if (daysDifference < 30) {
          counts[clinic].hosperRequiredASAP++;
          counts[clinic].hosperRequiredASAPPatientList.push({
            patientId: exam.patientId._id,
            patientName: `${exam.patientId.firstName} ${exam.patientId.lastName}`,
            dob: exam.patientId.dob,
            aptStatus: exam?.hosper ? exam?.hosper : "NA",
          });
        }
      }
      if (exam?.attestation === conditions?.attestation) {
        counts[clinic].attestationRequired++;
        counts[clinic].attestationRequiredPatientList.push({
          patientId: exam.patientId._id,
          patientName: `${exam.patientId.firstName} ${exam.patientId.lastName}`,
          dob: exam.patientId.dob,
          aptStatus: exam?.attestation ? exam?.attestation : "NA",
        });
      }
      if (conditions?.eyeStatus.includes(exam.eyeStatus)) {
        counts[clinic].eyeStatusNeedToScheduleOrRefused++;
        counts[clinic].eyeStatusNeedToScheduleOrRefusedPatientList.push({
          patientId: exam.patientId._id,
          patientName: `${exam.patientId.firstName} ${exam.patientId.lastName}`,
          dob: exam.patientId.dob,
          aptStatus: exam?.eyeStatus ? exam?.eyeStatus : "NA",
        });
      }
      if (conditions?.footStatus.includes(exam.footStatus)) {
        counts[clinic].footStatusNeedToScheduleOrRefused++;
        counts[clinic].footStatusNeedToScheduleOrRefusedPatientList.push({
          patientId: exam.patientId._id,
          patientName: `${exam.patientId.firstName} ${exam.patientId.lastName}`,
          dob: exam.patientId.dob,
          aptStatus: exam?.footStatus ? exam?.footStatus : "NA",
        });
      }
    }
  }

  // Return the counts in the response
  res.status(200).json(
    new ApiResponse(200, {
      counts: [counts],
    })
  );
});
export { getAllAppointments, getOverdueAptsAnalytics, getSpecialStatusCounts };
