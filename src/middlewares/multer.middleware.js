import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});

//to handle different type file
// export const upload2 = multer({
//   storage,
//   // fileFilter: function (req, file, cb) {

//   //   const filetypes = /pdf|doc|docx|txt/;
//   //   const mimetype = filetypes.test(file.mimetype);
//   //   const extname = filetypes.test(
//   //     path.extname(file.originalname).toLowerCase()
//   //   );

//   //   if (mimetype && extname) {
//   //     return cb(null, true);
//   //   } else {
//   //     cb(
//   //       "Error: File upload only supports the following filetypes - " +
//   //         filetypes
//   //     );
//   //   }
//   // },
// });
