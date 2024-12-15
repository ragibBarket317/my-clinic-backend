import { Router } from "express";
import {
  deleteMessage,
  getConversations,
  getMessages,
  sendMessage,
  updateMessage,
} from "../controllers/message.controller.js";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/conversations").get(verifyJWTAuthOfAdmins, getConversations);

router.route("/:id").get(verifyJWTAuthOfAdmins, getMessages);

router.route("/send/:id").post(verifyJWTAuthOfAdmins, sendMessage);

router.route("/delete/:id").delete(verifyJWTAuthOfAdmins, deleteMessage);

router.route("/update/:id").put(verifyJWTAuthOfAdmins, updateMessage);

export default router;
