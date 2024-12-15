import { ApiError } from "../utils/ApiError.js";

export const roleCheck = (roles) => {
  return async (req, res, next) => {
    try {
      // Check if user role matches any of the allowed roles
      if (!roles.includes(req.admin.role)) {
        throw new ApiError(403, "Forbidden: Access Denied");
      }
      // If role matches, proceed to the next middleware
      next();
    } catch (error) {
      next(error);
    }
  };
};
