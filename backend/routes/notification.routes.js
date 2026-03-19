import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

router.post('/subscribe', authenticate, notificationController.subscribe);
router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/mark-all-read', authenticate, notificationController.markAllAsRead);

export default router;
