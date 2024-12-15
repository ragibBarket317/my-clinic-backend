import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import {
//   deleteFromCloudinary,
//   uploadOnCloudinary,
// } from "../utils/cloudinary.js";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uploadOnS3 } from "../utils/awss3.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";

dotenv.config();

// Configure AWS S3 client with your credentials
export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION, // Specify your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const options = {
  httpOnly: true,
  secure: true,
};
if (process.env.PROJECT_MODE === "production") {
  options.domain = process.env.FRONTEND_URL;
  options.sameSite = "none";
}
const generateAccessAndRefereshTokens = async (id) => {
  try {
    const admin = await Admin.findById(id);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
// generate token for password reset
const generateToken = function (email) {
  return jwt.sign({ email }, process.env.GENERATEURL_TOKEN_SECRET, {
    expiresIn: process.env.GENERATEURL_FOR_RESET_PASSWORD_TOKEN_EXPIRY,
  });
};

// register Admin work
const registerAdmin = asyncHandler(async (req, res) => {
  // get details from frontend
  const { fullName, email, role, password } = req.body;
  // console.log("🚀 ~ registerAdmin ~ req.body:", req.body);
  //   console.log(req, "admin");

  // validation checks if any data not empty
  if ([fullName, email, role, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // check if Admin already exists
  const existedAdmin = await Admin.findOne({ email });

  if (existedAdmin.isActive === true) {
    throw new ApiError(409, "User with this email already exists");
  }

  // create user object - create entry in db
  const admin = await Admin.findByIdAndUpdate(existedAdmin._id, {
    fullName,
    email,
    role,
    isActive: true,
  });

  admin.password = password;
  await admin.save({ validateBeforeSave: false });

  //remove password and refresh token from response
  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdAdmin) {
    throw new ApiError(
      500,
      "Something went wrong while registering the admin account"
    );
  }
  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, createdAdmin, "Admin registered Successfully"));
});

// Login admin account
const loginAdmin = asyncHandler(async (req, res) => {
  // req body -> data
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }
  //find the admin
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }
  //password check
  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  //access and referesh token
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    admin._id
  );
  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );
  // //send cookie
  // const options = {
  //   httpOnly: true,
  //   secure: true,
  // };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          data: loggedInAdmin,
          accessToken,
          refreshToken,
        },
        "Admin logged In Successfully"
      )
    );
});
// verifying token is valid to keep the user logged in
const verifyToken = (req, res) => {
  if (req.admin) {
    return res
      .status(200)
      .json({ success: true, message: "Token is valid", data: req.admin });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Token is invalid" });
  }
};

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  // const options = {
  //   httpOnly: true,
  //   secure: true,
  // };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "logged Out Successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin?._id);
  const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  admin.password = newPassword;
  await admin.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getAllAdmins = asyncHandler(async (req, res) => {
  // Query the database to retrieve all admins except the one making the request
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  const admins = await Admin.find({
    _id: { $ne: req.admin._id },
    role: { $ne: "superadmin" },
  })
    .limit(limit)
    .skip(skip);
  const totalCount = await Admin.countDocuments({
    role: { $ne: "superadmin" }, // Count total admins excluding superadmins
  });
  const totalPages = Math.ceil(totalCount / limit);

  // If no admins are found, respond with a 404 status code and a message
  if (!admins || admins.length === 0) {
    throw new ApiError(404, "No admins found");
  }

  // If admins are found, respond with a 200 status code and the list of admins
  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalAdmins: totalCount,
        totalPages,
        currentPage: page,
        admins,
      },
      "All admins fetched successfully"
    )
  );
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  if (req.admin.avatarName) {
    req.admin.avatar = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `images/${req.admin.avatarName}`,
      }),
      { expiresIn: 3600 }
    );
  }
  if (req.admin.coverImageName) {
    req.admin.coverImage = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `images/${req.admin.coverImageName}`,
      }),
      { expiresIn: 3600 }
    );
  }
  // console.log(req.admin);
  return res
    .status(200)
    .json(new ApiResponse(200, req.admin, "Admin fetched successfully"));
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid admin ID");
  }

  // Check if the admin exists
  const admin = await Admin.findById(id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // If the admin exists, delete the admin from the database
  await Admin.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Admin deleted successfully"));
});

const updateAdminAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  // Retrieve the user's current avatar URL from the database
  const admin = await Admin.findById(req.admin?._id).select("avatarName");

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  const avatarName = await uploadOnS3(avatarLocalPath);

  if (!avatarName) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  // Check if there is a current avatar URL
  if (admin && admin.avatarName) {
    // Delete the old avatar image from Cloudinary
    // await deleteFromCloudinary(admin.avatar);
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `images/${admin.avatarName}`,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin?._id,
    {
      $set: {
        avatarName,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedAdmin, "Avatar image updated successfully")
    );
});

const updateAdminCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  // Retrieve the admin's current cover image URL from the database
  const admin = await Admin.findById(req.admin?._id).select("coverImageName");
  // console.log(admin, "checking avatar");
  // const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  const coverImageName = await uploadOnS3(coverImageLocalPath);

  if (!coverImageName) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  // Check if there is a current cover image URL
  if (admin && admin.coverImageName) {
    // Delete the old cover image from Cloudinary
    // await deleteFromCloudinary(admin.coverImage);
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `images/${admin.coverImageName}`,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  }

  // Update the admin's cover image Name in the database
  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin?._id,
    { $set: { coverImageName } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedAdmin, "Cover image updated successfully")
    );
});

const updateAdminAccountDetails = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    title,
    pronouns,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
  } = req.body;

  if (
    [
      fullName,
      email,
      title,
      pronouns,
      phoneNumber?.country,
      phoneNumber?.number,
      address,
      city,
      state,
      zipCode,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const admin = await Admin.findByIdAndUpdate(
    req.admin?._id,
    {
      $set: {
        fullName,
        email,
        title,
        pronouns,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
      },
    },
    { new: true, runValidators: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Account details updated successfully"));
});

const updateOtherAdminAccount = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  if ([id, role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Admin ID and role are required");
  }

  const admin = await Admin.findByIdAndUpdate(
    id,
    {
      $set: {
        role,
      },
    },
    { new: true, runValidators: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Role details updated successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken?._id);

    if (!admin) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== admin?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(admin._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Controller function for forgot password
const resetPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Validate input
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  // check if email exists
  const existedadmin = await Admin.findOne({ email: email });

  if (!existedadmin) {
    // If user does not exist, return a success response to prevent email enumeration attacks
    res.status(200).json(new ApiResponse(200, {}, "The email doesn't exists."));
  }
  // Check if admin is a superadmin
  if (existedadmin.role === "superadmin") {
    return res
      .status(403)
      .json(new ApiResponse(403, {}, "Superadmin's password cannot be reset."));
  }

  // generate the token for the URL
  const Token = generateToken(email);

  // send reset password mail with token
  try {
    await sendResetPasswordEmail(email, Token);
    // return response
    return res
      .status(201)
      .json(new ApiResponse(200, "Reset Password email sent successfully"));
  } catch (error) {
    console.error("Error while sending the email:", error);
    throw new ApiError(500, "Failed to send email");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  // Extract new password from request body
  const { newPassword, token } = req.body;
  if ([token, newPassword].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  //   Verifying token here
  const decoded = jwt.verify(token, process.env.GENERATEURL_TOKEN_SECRET);

  // Check if the reset token is valid and not expired
  if (!decoded) {
    throw new ApiError(400, "Invalid token");
  }

  const admin = await Admin.findOne({ email: decoded.email });
  admin.password = newPassword;
  await admin.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successful"));
});
export {
  changeCurrentPassword,
  deleteAdmin,
  getAllAdmins,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  registerAdmin,
  resetPassword,
  resetPasswordEmail,
  updateAdminAccountDetails,
  updateAdminAvatar,
  updateAdminCoverImage,
  updateOtherAdminAccount,
  verifyToken,
};
