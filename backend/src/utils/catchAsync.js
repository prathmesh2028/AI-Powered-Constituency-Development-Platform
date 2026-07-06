/**
 * Async Error Wrapper (catchAsync)
 * 
 * Purpose:
 * Wraps asynchronous controller functions to automatically catch any rejected Promises
 * (e.g., database errors, network failures) and pass them directly to the Express 
 * global error handler (next). 
 * 
 * This eliminates the need for repetitive try/catch blocks in every single controller.
 * 
 * @param {Function} fn - The async controller function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
