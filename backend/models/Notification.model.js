import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientRole",
    },
    recipientRole: {
      type: String,
      required: true,
      enum: ["admin", "institute", "learner", "employer"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderRole",
    },
    senderRole: {
      type: String,
      enum: ["admin", "institute", "learner", "employer"],
    },
    type: {
      type: String,
      required: true,
      enum: [
        "credential_uploaded",
        "credential_verified",
        "credential_rejected",
        "institute_approved",
        "institute_rejected",
        "enrollment_created",
        "level_upgraded",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedModel: {
      type: String,
      enum: ["Credential", "Institute", "Learner", "Enrollment", "Pathway"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
