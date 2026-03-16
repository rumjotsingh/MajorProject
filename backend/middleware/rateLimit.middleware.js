import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

export const createRateLimiter = (options = {}) => {
  const config = {
    windowMs: options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: options.max || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  };

  // Use Redis store if available
  if (process.env.REDIS_URL) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.connect().catch(console.error);

    config.store = new RedisStore({
      client,
      prefix: 'rl:',
    });
  }

  return rateLimit(config);
};

// Specific rate limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // 10 requests per window
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 uploads per minute
});

export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
});
