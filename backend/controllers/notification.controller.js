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

// GET /notifications/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.userId,
      read: false 
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// PUT /notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// PUT /notifications/mark-all-read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

