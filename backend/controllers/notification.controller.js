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

// POST /notifications/sync-issuer-history (Issuer only)
export const syncIssuerHistory = async (req, res, next) => {
  try {
    // Only allow issuers to sync
    if (req.user.role !== 'Issuer') {
      return res.status(403).json({ error: 'Only issuers can sync notification history' });
    }

    const Credential = (await import('../models/Credential.model.js')).default;
    const Issuer = (await import('../models/Issuer.model.js')).default;
    const User = (await import('../models/User.model.js')).default;

    // Find issuer by user email
    const issuer = await Issuer.findOne({ contactEmail: req.user.email });
    if (!issuer) {
      return res.status(404).json({ error: 'Issuer profile not found' });
    }

    // Get all credentials for this issuer
    const credentials = await Credential.find({ issuerId: issuer._id })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    let created = 0;
    let skipped = 0;

    for (const credential of credentials) {
      // Check if notification already exists
      const existing = await Notification.findOne({
        userId: req.user.userId,
        'metadata.credentialId': credential._id
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create notification
      let message = '';
      let type = 'System';

      if (credential.verificationStatus === 'verified') {
        message = `Credential "${credential.title}" verified for ${credential.userId?.name || 'learner'}`;
        type = 'CredentialVerified';
      } else if (credential.verificationStatus === 'pending') {
        message = `Credential "${credential.title}" uploaded by ${credential.userId?.name || 'learner'} - pending verification`;
      } else {
        message = `Credential "${credential.title}" issued to ${credential.userId?.name || 'learner'}`;
      }

      await Notification.create({
        userId: req.user.userId,
        type,
        message,
        read: true, // Mark as read since they're historical
        metadata: {
          credentialId: credential._id,
          learnerId: credential.userId?._id
        },
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt
      });

      created++;
    }

    res.json({
      message: 'Notification history synced successfully',
      created,
      skipped,
      total: credentials.length
    });
  } catch (error) {
    next(error);
  }
};

export default {
  subscribe,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  syncIssuerHistory,
};

