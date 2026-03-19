import Notification from '../models/Notification.model.js';
import logger from './logger.js';

/**
 * Send notification to user via database and WebSocket
 * @param {Object} app - Express app instance
 * @param {String} userId - User ID to send notification to
 * @param {String} type - Notification type
 * @param {String} message - Notification message
 * @param {Object} metadata - Additional metadata
 */
export const sendNotification = async (app, userId, type, message, metadata = {}) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      userId,
      type,
      message,
      metadata,
    });

    // Send via WebSocket if user is connected
    if (app.locals.io && app.locals.connectedUsers) {
      const socketId = app.locals.connectedUsers.get(userId.toString());
      if (socketId) {
        app.locals.io.to(socketId).emit('notification', {
          _id: notification._id,
          type: notification.type,
          message: notification.message,
          read: notification.read,
          metadata: notification.metadata,
          createdAt: notification.createdAt,
        });
        logger.info(`Real-time notification sent to user ${userId}`);
      }
    }

    return notification;
  } catch (error) {
    logger.error('Failed to send notification:', error);
    throw error;
  }
};

export default { sendNotification };
