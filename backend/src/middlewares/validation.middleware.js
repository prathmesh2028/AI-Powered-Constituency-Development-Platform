import { ZodError } from "zod";

/**
 * Validation Middleware Wrapper
 * 
 * Purpose:
 * A generic, reusable middleware that takes a validation schema (Zod)
 * and applies it against the incoming request body, query, or params.
 * 
 * If validation passes, it proceeds to the controller.
 * If validation fails, it intercepts the request and immediately returns a 400 Bad Request
 * with the formatted validation errors, keeping controllers clean of validation logic.
 * 
 * @param {import("zod").ZodSchema} schema - The Zod validation schema object
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // Parse the incoming request body asynchronously
      const validatedBody = await schema.parseAsync(req.body);
      
      // Optionally re-assign the validated/sanitized body back to the request
      req.body = validatedBody;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors into a clean, flat array of messages
        const formattedErrors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: formattedErrors
        });
      }
      
      // Forward generic errors to the global error handler
      next(error);
    }
  };
};
