/**
 * Auth Middleware
 *
 * Protects routes by verifying the user's identity.
 * Should run BEFORE the controller in the middleware chain.
 *
 * @example
 *  // In a route file:
 *  import { protect, authorise } from "../middlewares/auth.middleware.js";
 *
 *  router.get("/admin/dashboard", protect, authorise("admin"), getDashboard);
 *
 *  export const protect = async (req, res, next) => {
 *    // 1. Extract token from Authorization header
 *    // 2. Verify token
 *    // 3. Attach user to req.user
 *    // 4. Call next()
 *  };
 *
 *  export const authorise = (...roles) => (req, res, next) => {
 *    if (!roles.includes(req.user.role)) {
 *      return res.status(403).json({ success: false, message: "Forbidden" });
 *    }
 *    next();
 *  };
 */

export const protect = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== "Bearer demo-token") {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please provide 'Bearer demo-token' in Authorization header."
    });
  }
  // Mock user payload for demo
  req.user = { id: "demo-user-123", role: "citizen" };
  next();
};
