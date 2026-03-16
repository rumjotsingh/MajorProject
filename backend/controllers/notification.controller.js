import Notification from '../models/Notification.model.js';

// POST /notifications/subscribe
export const subscribe = async (req, res, next) => {
  try {
    const { type, address } = req.body;
    // In a real implementation, store subscription preferences
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

