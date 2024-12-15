import { Router } from "express";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
import { getMetricsForOverview } from "../controllers/overview.controller.js";

const router = Router();

router.route("/get-metrics").get(verifyJWTAuthOfAdmins, getMetricsForOverview);

export default router;
