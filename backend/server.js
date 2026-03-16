import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createClient } from 'redis';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { configureCloudinary } from './config/cloudinary.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import profileRoutes from './routes/profile.routes.js';
import credentialRoutes from './routes/credential.routes.js';
import issuerRoutes from './routes/issuer.routes.js';
import employerRoutes from './routes/employer.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import nsqfRoutes from './routes/nsqf.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();

// Configure Cloudinary
configureCloudinary();

const app = express();
const PORT = process.env.PORT || 5000;

// Redis client setup (optional)
let redisClient;
if (process.env.REDIS_URL) {
  (async () => {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      redisClient.on('error', (err) => logger.warn('Redis Client Error (continuing without Redis):', err.message));
      await redisClient.connect();
      logger.info('Redis connected successfully');
      app.locals.redis = redisClient;
    } catch (error) {
      logger.warn('Redis connection failed, continuing without cache:', error.message);
    }
  })();
} else {
  logger.info('Redis URL not configured, skipping Redis connection');
}

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/issuer', issuerRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/nsqf', nsqfRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('MongoDB connected successfully');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (redisClient) await redisClient.quit();
  await mongoose.connection.close();
  process.exit(0);
});

export default app;
