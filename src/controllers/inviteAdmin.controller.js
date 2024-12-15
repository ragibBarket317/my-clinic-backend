import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendInvitationEmail } from "../utils/sendInvitationEmail.js";

const generateToken = function (email, role) {
  return jwt.sign({ email, role }, process.env.GENERATEURL_TOKEN_SECRET, {
    expiresIn: process.env.GENERATEURL_TOKEN_EXPIRY,
  });
};

const registerInvitation = asyncHandler(async (req, res) => {
  // get details from frontend
  const { email, role } = req.body;

  // validation checks if any data not empty
  if ([email, role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Email or role is missing");
  }
  // Check if the admin already exists
  const existedAdmin = await Admin.findOne({ email });
  if (existedAdmin) {
    throw new ApiError(409, "This user is already an admin");
  }

  // generate the token for the URL
  const Token = generateToken(email, role);

  // send Invitation mail
  try {
    await sendInvitationEmail(email, Token, role);
    // create user object - create entry in db
    await Admin.create({
      email,
      role,
    });
    // return response
    return res
      .status(201)
      .json(new ApiResponse(200, "Invitation sent Successfully"));
  } catch (error) {
    console.error("Error while sending the invitation email:", error);
    throw new ApiError(500, "Failed to send invitation email");
  }
});

const verifyInvitationToken = asyncHandler(async (req, res) => {
  const token = req.params.token;

  //   Verifying token here
  jwt.verify(token, process.env.GENERATEURL_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      throw new ApiError(400, "Invalid token");
    }
    // Send response with user email and role
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          email: decoded.email,
          role: decoded.role,
        },
        "Token verified"
      )
    );
  });
});

export { registerInvitation, verifyInvitationToken };
