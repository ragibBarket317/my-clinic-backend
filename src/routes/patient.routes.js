import { Router } from "express";
import {
  addPatient,
  deletePatient,
  getAllPatients,
  getAllPatientsForExcel,
  getPatient,
  updatePatient,
} from "../controllers/patient.controller.js";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";
import {
  addMedicalHistory,
  checkMedicalHistory,
  updateMedicalHistory,
} from "../controllers/medicalHistory.controller.js";
import {
  addLabsData,
  checkLabs,
  updateLabsData,
} from "../controllers/labsData.controller.js";
import {
  addPatientExam,
  checkPatientExam,
  updatePatientExam,
} from "../controllers/patientExam.controller.js";
import {
  getmissedApts,
  getmissedAptsManually,
} from "../controllers/missedAppointments.controller.js";

const router = Router();

router
  .route("/add-patient")
  .post(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    addPatient
  );
router.route("/getPatients").post(verifyJWTAuthOfAdmins, getAllPatients);
// route for excel feature in patient list view
router
  .route("/getPatients-excel")
  .post(verifyJWTAuthOfAdmins, getAllPatientsForExcel);

router.route("/get-patient/:id").get(verifyJWTAuthOfAdmins, getPatient);
router
  .route("/update-patient/:id")
  .patch(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    updatePatient
  );
router
  .route("/delete-patient/:id")
  .delete(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "admin", "editor"]),
    deletePatient
  );

// Medical History routes

router
  .route("/check-medical-history/:id")
  .get(verifyJWTAuthOfAdmins, checkMedicalHistory);

router
  .route("/add-medical-history/:id")
  .post(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    addMedicalHistory
  );

router
  .route("/update-medical-history/:id")
  .patch(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    updateMedicalHistory
  );

// labs routes

router.route("/check-labs/:id").get(verifyJWTAuthOfAdmins, checkLabs);

router
  .route("/add-labs/:id")
  .post(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    addLabsData
  );

router
  .route("/update-labs-data/:id")
  .patch(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    updateLabsData
  );

// examinations route

router.route("/check-exams/:id").get(verifyJWTAuthOfAdmins, checkPatientExam);

router
  .route("/add-exams/:id")
  .post(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    addPatientExam
  );

router
  .route("/update-exams/:id")
  .patch(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin", "editor", "admin"]),
    updatePatientExam
  );

// get route for missed appointments
router.route("/missed-apts").get(verifyJWTAuthOfAdmins, getmissedApts);

// manually update missed appointments
router
  .route("/missed-apts-update-manually")
  .get(verifyJWTAuthOfAdmins, getmissedAptsManually);

export default router;
