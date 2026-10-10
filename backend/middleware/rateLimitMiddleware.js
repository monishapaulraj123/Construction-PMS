import rateLimit from 'express-rate-limit'

// Auth Rate Limiter (Login / Credentials) - Max 15 requests per 15 minutes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
})

// AI & Voice Assistant Rate Limiter - Max 40 requests per 5 minutes
export const aiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI query limit reached. Please wait a few minutes before asking more questions.',
  },
})

// General API Rate Limiter - Max 300 requests per 15 minutes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
})
