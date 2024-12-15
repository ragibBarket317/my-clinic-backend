import { LabsData } from "../models/labsData.model.js";
import PatientExam from "../models/patientExam.models.js";
import cron from "node-cron";

const moveDataToPreviousYearSpecificCollections = async () => {
  try {
    // Get previous year
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // Check if there are any documents to move from LabsData and PatientExam
    const labsDataCount = await LabsData.countDocuments();
    const patientExamCount = await PatientExam.countDocuments();
    // console.log(labsDataCount, patientExamCount);

    if (labsDataCount > 0) {
      // Move LabsData to year-specific collection
      await LabsData.aggregate([{ $out: `labsdatas_${previousYear}` }]);
      // Clear LabsData collection
      await LabsData.deleteMany({});
    }

    if (patientExamCount > 0) {
      // Move PatientExam to year-specific collection
      await PatientExam.aggregate([{ $out: `patientexams_${previousYear}` }]);
      // Clear PatientExam collection
      await PatientExam.deleteMany({});
    }
    console.log(`Data moved to year-specific collections for ${previousYear}`);
  } catch (error) {
    console.error("Error moving data to year-specific collections:", error);
  }
};

// Schedule the cleanup job to run at midnight on January 1st every year
cron.schedule("0 0 1 1 *", moveDataToPreviousYearSpecificCollections);

// cron.schedule("*/5 * * * * *", moveDataToPreviousYearSpecificCollections);
