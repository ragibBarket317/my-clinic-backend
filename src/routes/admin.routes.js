import { Router } from "express";
import {
  changeCurrentPassword,
  deleteAdmin,
  getAllAdmins,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  registerAdmin,
  updateAdminAccountDetails,
  updateAdminAvatar,
  updateAdminCoverImage,
  verifyToken,
  updateOtherAdminAccount,
  resetPassword,
  resetPasswordEmail,
} from "../controllers/admin.controller.js";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = Router();

router.route("/register").patch(registerAdmin);
router.route("/login").post(loginAdmin);
// forget password related api's
router.route("/reset-password-email").post(resetPasswordEmail);
router.route("/reset-password").post(resetPassword);

router.route("/refresh-token").post(refreshAccessToken);

// secured routes
router.route("/logout").post(verifyJWTAuthOfAdmins, logoutAdmin);
router.route("/verify-token").get(verifyJWTAuthOfAdmins, verifyToken);
router.route("/admins-list").get(verifyJWTAuthOfAdmins, getAllAdmins);
router.route("/current-admin").get(verifyJWTAuthOfAdmins, getCurrentAdmin);
router
  .route("/avatar")
  .patch(verifyJWTAuthOfAdmins, upload.single("avatar"), updateAdminAvatar);
router
  .route("/cover-image")
  .patch(
    verifyJWTAuthOfAdmins,
    upload.single("coverImage"),
    updateAdminCoverImage
  );
router
  .route("/update-account")
  .patch(verifyJWTAuthOfAdmins, updateAdminAccountDetails);
router
  .route("/change-password")
  .post(verifyJWTAuthOfAdmins, changeCurrentPassword);

// api routes of manage members page
router
  .route("/update-admin/:id")
  .patch(
    verifyJWTAuthOfAdmins,
    roleCheck(["superadmin"]),
    updateOtherAdminAccount
  );
router
  .route("/delete-admin/:id")
  .delete(verifyJWTAuthOfAdmins, roleCheck(["superadmin"]), deleteAdmin);

export default router;
