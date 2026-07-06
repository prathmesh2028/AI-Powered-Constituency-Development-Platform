import config from "../config/index.js";

/**
 * Error Handler Middleware
 *
 * Centralized Express error handler. Catches all errors passed via next(err).
 * Formats the response differently in dev vs production, ensuring no internal
 * database/system details are leaked in production.
 */
export const errorHandler = (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // 1. Identify and normalise specific third-party errors
  // Multer payload size limit or file filter validation
  if (err.name === "MulterError" || err.message.includes("Only JPEG, PNG")) {
    error.statusCode = 400;
    error.isOperational = true;
  }

  // Mongoose bad ObjectId format
  if (err.name === "CastError") {
    error.statusCode = 400;
    error.message = `Invalid field path: ${err.path}`;
    error.isOperational = true;
  }

  // Mongoose duplicate key violation
  if (err.code === 11000) {
    error.statusCode = 409;
    error.message = "Resource duplicate value conflict";
    error.isOperational = true;
  }

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log non-operational errors with full stack trace for backend observability
  if (config.isDev || !isOperational) {
    console.error("💥 Error event logged:", error.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message: config.isDev || isOperational ? error.message : "Internal server error",
    error: {
      ...(config.isDev && { stack: error.stack }),
      ...(error.errors && { details: error.errors })
    }
  });
};
