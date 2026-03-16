import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

router.post('/subscribe', authenticate, notificationController.subscribe);
router.get('/', authenticate, notificationController.getNotifications);

export default router;
