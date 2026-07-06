/**
 * Request Logger Middleware
 * 
 * Purpose:
 * Intercepts every incoming request to log the HTTP method, URL, and timestamp.
 * In a production app, this acts as the foundational building block for observability, 
 * auditing, and rate-limiting analytics. It gives developers immediate visibility into 
 * traffic patterns without needing to check cloud load balancer logs.
 */
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
  });

  next();
};
