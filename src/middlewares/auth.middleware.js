import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWTAuthOfAdmins = asyncHandler(async (req, _, next) => {
  try {
    // console.log("verifyJWTAuthOfAdmins", req);
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!admin) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.admin = admin;
    // console.log(req.body, "from middle");
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
