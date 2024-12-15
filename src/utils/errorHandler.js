// Import the ApiError class

import { ApiError } from "./ApiError.js";

// Error handling middleware
function errorHandler(err, req, res, next) {
  // Check if the error is an instance of ApiError
  if (err instanceof ApiError) {
    // Send the error as JSON response
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // If the error is not an instance of ApiError, pass it to the default Express error handler
  next(err);
}

// Export the middleware
export { errorHandler };
