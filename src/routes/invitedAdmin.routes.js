import { Router } from "express";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
import {
  registerInvitation,
  verifyInvitationToken,
} from "../controllers/inviteAdmin.controller.js";

const router = Router();

router.route("/verifyToken/:token").post(verifyInvitationToken);

// secured route to sent invitation mail to create admin
router.route("/admin").post(verifyJWTAuthOfAdmins, registerInvitation);

export default router;
