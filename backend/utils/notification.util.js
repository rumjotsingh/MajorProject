import Notification from '../models/Notification.model.js';
import logger from './logger.js';
import nodemailer from 'nodemailer';

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

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.html - Email HTML content
 * @param {String} options.text - Email text content (optional)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CredMatrix" <noreply@credmatrix.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
      html,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Failed to send email:', error);
    // Don't throw error - email is not critical
    return null;
  }
};

export default { sendNotification, sendEmail };
