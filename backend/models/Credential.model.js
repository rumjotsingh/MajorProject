import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    issuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issuer',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    certificateUrl: {
      type: String,
      required: true,
    },
    certificateHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    revokeReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
credentialSchema.index({ userId: 1, verificationStatus: 1 });
credentialSchema.index({ issuerId: 1, createdAt: -1 });

export default mongoose.model('Credential', credentialSchema);
