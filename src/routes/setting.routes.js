import { Router } from "express";

import {
  changeNotificationSettings,
  changeThemeSettings,
  changeTimeLangSettings,
} from "../controllers/setting.controller.js";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";

const router = Router();

router.patch(
  "/notification",
  verifyJWTAuthOfAdmins,
  changeNotificationSettings
);

router.patch("/theme", verifyJWTAuthOfAdmins, changeThemeSettings);

router.patch("/time-lang", verifyJWTAuthOfAdmins, changeTimeLangSettings);

export default router;
