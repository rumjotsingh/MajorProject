import mongoose from 'mongoose';

const learnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    education: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching by skills
learnerProfileSchema.index({ skills: 1 });
learnerProfileSchema.index({ nsqfLevel: 1 });

export default mongoose.model('LearnerProfile', learnerProfileSchema);
