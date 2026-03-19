import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;

export const connectRedis = async () => {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('Redis URL not configured, skipping Redis connection');
      return null;
    }

    redisClient = createClient({ url: process.env.REDIS_URL });
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn('Redis connection failed:', error.message);
    return null;
  }
};

export const getRedisClient = () => redisClient;
