import { Router } from "express";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
import {
  getNotificationsForAdmin,
  markAllNotificationsAsRead,
  getNotificationsUnreadCount,
  markOneNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router
  .route("/get-notifications")
  .get(verifyJWTAuthOfAdmins, getNotificationsForAdmin);

router
  .route("/get-unread-notifications")
  .get(verifyJWTAuthOfAdmins, getNotificationsUnreadCount);

router
  .route("/mark-read-notifications")
  .get(verifyJWTAuthOfAdmins, markAllNotificationsAsRead);

router
  .route("/mark-read-notification/:id")
  .get(verifyJWTAuthOfAdmins, markOneNotificationAsRead);

export default router;
