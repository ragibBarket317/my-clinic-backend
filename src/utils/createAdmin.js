import * as dotenv from "dotenv";
import { Admin } from "../models/admin.model.js";
import { asyncHandler } from "./asyncHandler.js";
dotenv.config();

// const createSuperAdmin = asyncHandler(async (req, res, next) => {
//   // Check if superadmin exists
//   const existingAdmin = await Admin.findOne({ role: "superadmin" });

//   // If superadmin exists
//   if (existingAdmin) {
//     // Check if the existing superadmin's email matches the one in the environment variables
//     if (existingAdmin.email !== process.env.SUPERADMIN_EMAIL) {
//       // Delete the existing superadmin
//       await Admin.deleteOne({ _id: existingAdmin._id });
//       console.log("Previous superadmin deleted.");

//       // Create a new superadmin with the updated details
//       existingAdmin = null; // Reset existingAdmin
//     }
//   }

//   // If superadmin doesn't exist or was deleted
//   if (!existingAdmin) {
//     await Admin.create({
//       fullName: process.env.SUPERADMIN_FULL_NAME,
//       email: process.env.SUPERADMIN_EMAIL,
//       password: process.env.SUPERADMIN_PASSWORD,
//       role: "superadmin",
//       isActive: true,
//     });
//     console.log("Superadmin account created successfully.");
//   }
// });

const createSuperAdmin = async (req, res) => {
  try {
    // Check if superadmin exists
    let existingAdmin = await Admin.findOne({ role: "superadmin" });

    // If superadmin exists
    if (existingAdmin) {
      // Check if the existing superadmin's email matches the one in the environment variables
      if (existingAdmin.email !== process.env.SUPERADMIN_EMAIL) {
        // Delete the existing superadmin
        await Admin.deleteOne({ _id: existingAdmin._id });
        console.log("Previous superadmin deleted.");

        // Create a new superadmin with the updated details
        existingAdmin = null; // Reset existingAdmin
      }
    }

    // If superadmin doesn't exist or was deleted
    if (!existingAdmin) {
      await Admin.create({
        fullName: process.env.SUPERADMIN_FULL_NAME,
        email: process.env.SUPERADMIN_EMAIL,
        password: process.env.SUPERADMIN_PASSWORD,
        role: "superadmin",
        isActive: true,
      });
      console.log("Superadmin account created successfully.");
    }
  } catch (error) {
    console.log(error);
  }
};

export { createSuperAdmin };
