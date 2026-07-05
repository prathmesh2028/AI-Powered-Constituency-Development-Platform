/**
 * Async Handler
 *
 * Wraps an async route handler so that any rejected promise
 * is automatically forwarded to Express's error handler via next().
 * Eliminates the need for try/catch in every controller.
 *
 * @param {Function} fn - An async Express route handler
 * @returns {Function} Express middleware
 *
 * @example
 *  import asyncHandler from "../utils/asyncHandler.js";
 *
 *  // Without asyncHandler (repetitive):
 *  export const getIssues = async (req, res, next) => {
 *    try {
 *      const issues = await Issue.find();
 *      res.json({ success: true, data: issues });
 *    } catch (err) {
 *      next(err);
 *    }
 *  };
 *
 *  // With asyncHandler (clean):
 *  export const getIssues = asyncHandler(async (req, res) => {
 *    const issues = await Issue.find();
 *    res.json({ success: true, data: issues });
 *  });
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
