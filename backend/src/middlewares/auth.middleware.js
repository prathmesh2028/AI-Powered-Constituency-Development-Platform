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

// TODO: Implement auth middleware
