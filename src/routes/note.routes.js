import { Router } from "express";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
import {
  addNote,
  deleteNote,
  toggleNoteResolved,
  updateNote,
} from "../controllers/note.controller.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = Router();

// add note route for editors
router
  .route("/add-note")
  .post(
    verifyJWTAuthOfAdmins,
    roleCheck(["editor", "admin", "superadmin"]),
    addNote
  );

// update note route for editors
router
  .route("/update-note/:id")
  .patch(
    verifyJWTAuthOfAdmins,
    roleCheck(["editor", "admin", "superadmin"]),
    updateNote
  );

// update the opened or resolved route for editors
router
  .route("/toggle-note-resolve/:id")
  .patch(
    verifyJWTAuthOfAdmins,
    roleCheck(["editor", "admin", "superadmin"]),
    toggleNoteResolved
  );

// delete note route for editors
router
  .route("/delete-note/:id")
  .delete(
    verifyJWTAuthOfAdmins,
    roleCheck(["editor", "admin", "superadmin"]),
    deleteNote
  );

export default router;
