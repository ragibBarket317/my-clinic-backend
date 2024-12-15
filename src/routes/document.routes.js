// import { Router } from "express";
// import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";
// import { uploadDocument } from "../controllers/document.controller.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const router = Router();

// router
//   .route("/upload-documents")
//   .post(verifyJWTAuthOfAdmins, upload.array("documents"), uploadDocument);

// export default router;
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadDocumentsToS3 } from "../utils/awss3.js";
import {
  uploadDocuments,
  getDocuments,
  downloadDocument,
  deleteDocument,
  editDocument,
} from "../controllers/document.controller.js";
import { verifyJWTAuthOfAdmins } from "../middlewares/auth.middleware.js";

const router = Router();
router.post(
  "/upload",
  verifyJWTAuthOfAdmins,
  upload.array("documents", 10),
  uploadDocumentsToS3,
  uploadDocuments
);

router.get("/all", verifyJWTAuthOfAdmins, getDocuments);

router.get("/download/:documentId", verifyJWTAuthOfAdmins, downloadDocument);
router.patch("/edit/:documentId", verifyJWTAuthOfAdmins, editDocument);

router.delete("/delete/:documentId", verifyJWTAuthOfAdmins, deleteDocument);
export default router;
