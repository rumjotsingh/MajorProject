import mongoose from 'mongoose';

const normalizeStringList = (value) => {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    )
  );
};

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
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    credentialType: {
      type: String,
      enum: ['micro-credential', 'course-certificate', 'degree', 'license', 'other'],
      default: 'micro-credential',
      index: true,
    },
    category: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    tags: {
      type: [String],
      default: [],
      set: normalizeStringList,
    },
    learningOutcomes: {
      type: [String],
      default: [],
      set: normalizeStringList,
    },
    skills: {
      type: [String],
      default: [],
      set: normalizeStringList,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 40,
      validate: {
        validator: Number.isInteger,
        message: 'Credits must be an integer value',
      },
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
    expiryDate: {
      type: Date,
      default: null,
    },
    assessmentType: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    grade: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40,
    },
    score: {
      value: { type: Number, default: null },
      max: { type: Number, default: null },
    },
    durationHours: {
      type: Number,
      min: 0,
      default: null,
    },
    certificateUrl: {
      type: String,
      required: true,
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    source: {
      platform: { type: String, default: '', trim: true, maxlength: 120 },
      externalId: { type: String, default: '', trim: true, maxlength: 200 },
      uploadMethod: { type: String, default: 'manual', trim: true, maxlength: 60 },
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
    aiInsights: {
      summary: { type: String, default: '' },
      extractedSkills: { type: [String], default: [] },
      suggestedCareerPaths: { type: [String], default: [] },
      confidence: { type: Number, min: 0, max: 1, default: null },
      provider: { type: String, default: '' },
      model: { type: String, default: '' },
      status: {
        type: String,
        enum: ['not-run', 'success', 'failed'],
        default: 'not-run',
      },
      reason: { type: String, default: '' },
      analyzedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Compound indexes for queries
credentialSchema.index({ userId: 1, verificationStatus: 1 });
credentialSchema.index({ issuerId: 1, createdAt: -1 });
credentialSchema.index({ userId: 1, createdAt: -1 });
credentialSchema.index({ userId: 1, credentialType: 1, verificationStatus: 1 });
credentialSchema.index({ userId: 1, issueDate: -1 });

credentialSchema.virtual('isExpired').get(function isExpired() {
  return Boolean(this.expiryDate && this.expiryDate < new Date());
});

export default mongoose.model('Credential', credentialSchema);
