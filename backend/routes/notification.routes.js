import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as notificationController from "../controllers/notification.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/:notificationId/read", notificationController.markAsRead);
router.patch("/mark-all-read", notificationController.markAllAsRead);
router.delete("/:notificationId", notificationController.deleteNotification);
router.delete("/read/all", notificationController.deleteAllRead);

export default router;
