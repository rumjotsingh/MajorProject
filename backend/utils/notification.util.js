import Notification from "../models/Notification.model.js";

/**
 * Create and emit a notification
 * @param {Object} io - Socket.io instance
 * @param {Object} notificationData - Notification data
 */
export const createAndEmitNotification = async (io, notificationData) => {
  try {
    const notification = await Notification.create(notificationData);

    // Emit to specific user room
    const roomId = `user_${notificationData.recipientId}_${notificationData.recipientRole}`;
    io.to(roomId).emit("new_notification", notification);

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Notify institute about new credential upload
 */
export const notifyCredentialUploaded = async (io, credentialData) => {
  const { institutionId, learnerId, title, credentialId } = credentialData;

  return createAndEmitNotification(io, {
    recipientId: institutionId,
    recipientRole: "institute",
    senderId: learnerId,
    senderRole: "learner",
    type: "credential_uploaded",
    title: "New Credential Uploaded",
    message: `A learner has uploaded a new credential: "${title}" for verification`,
    relatedId: credentialId,
    relatedModel: "Credential",
    data: {
      credentialId,
      credentialTitle: title,
    },
  });
};

/**
 * Notify learner about credential verification
 */
export const notifyCredentialVerified = async (io, credentialData) => {
  const { learnerId, institutionId, title, credentialId } = credentialData;

  return createAndEmitNotification(io, {
    recipientId: learnerId,
    recipientRole: "learner",
    senderId: institutionId,
    senderRole: "institute",
    type: "credential_verified",
    title: "Credential Verified",
    message: `Your credential "${title}" has been verified successfully!`,
    relatedId: credentialId,
    relatedModel: "Credential",
    data: {
      credentialId,
      credentialTitle: title,
    },
  });
};

/**
 * Notify learner about credential rejection
 */
export const notifyCredentialRejected = async (io, credentialData) => {
  const { learnerId, institutionId, title, credentialId, reason } =
    credentialData;

  return createAndEmitNotification(io, {
    recipientId: learnerId,
    recipientRole: "learner",
    senderId: institutionId,
    senderRole: "institute",
    type: "credential_rejected",
    title: "Credential Rejected",
    message: `Your credential "${title}" was rejected. Reason: ${reason}`,
    relatedId: credentialId,
    relatedModel: "Credential",
    data: {
      credentialId,
      credentialTitle: title,
      rejectionReason: reason,
    },
  });
};

/**
 * Notify learner about level upgrade
 */
export const notifyLevelUpgrade = async (io, levelData) => {
  const { learnerId, newLevel, oldLevel } = levelData;

  return createAndEmitNotification(io, {
    recipientId: learnerId,
    recipientRole: "learner",
    type: "level_upgraded",
    title: "Level Up!",
    message: `Congratulations! You've advanced from Level ${oldLevel} to Level ${newLevel}!`,
    relatedModel: "Learner",
    data: {
      newLevel,
      oldLevel,
    },
  });
};
