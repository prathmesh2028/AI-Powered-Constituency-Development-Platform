/**
 * AppError
 *
 * A custom Error subclass representing operational errors in the application.
 * Operational errors are predictable errors we expect (validation failures,
 * unauthorized access, resource not found, etc.) as opposed to programmer bugs
 * (undefined variable access, database connection loss, etc.).
 *
 * @extends Error
 *
 * @example
 *  import AppError from "../utils/appError.js";
 *
 *  if (!user) {
 *    throw new AppError("User not found", 404);
 *  }
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Capture the call stack, excluding this constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
