import { Router } from "express";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
import {
  getAllAppointments,
  getOverdueAptsAnalytics,
  getSpecialStatusCounts,
} from "../controllers/appointment.controller.js";
const router = Router();

router
  .route("/getappointmentsdata")
  .get(verifyJWTAuthOfAdmins, getAllAppointments);

router
  .route("/overdue-appointments-analytics")
  .get(verifyJWTAuthOfAdmins, getOverdueAptsAnalytics);

router
  .route("/special-status-counts")
  .get(verifyJWTAuthOfAdmins, getSpecialStatusCounts);

export default router;
