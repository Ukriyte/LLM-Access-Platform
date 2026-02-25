const rateLimit = require("express-rate-limit");

/**
 * General API limiter
 * prevents spam on all routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // 300 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests."
  }
});

/**
 * STRICT limiter for AI model calls
 * expensive endpoint
 */
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 20, // 20 model calls/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please wait a minute."
  }
});

module.exports = {
  generalLimiter,
  aiLimiter
};