/**
 * 404 Not Found Middleware
 * 
 * Purpose:
 * Placed at the very end of the route definitions in app.js, this middleware
 * catches any HTTP requests that do not match a defined route. It intercepts
 * the request and returns a standardized JSON 404 response instead of the 
 * default Express HTML 404 page, ensuring API consistency.
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message
  });
};
