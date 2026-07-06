import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * 
 * Protects the backend from Denial of Service (DoS) attacks and brute force
 * scraping by limiting the number of requests a single IP can make within a time window.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict Write Rate Limiter
 * 
 * Applied specifically to POST/PUT/PATCH endpoints (like creating a suggestion or AI analysis).
 * Much stricter to prevent database bloating and expensive API bills.
 */
export const strictWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 write requests per hour
  message: {
    success: false,
    message: 'Submission limit reached. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
