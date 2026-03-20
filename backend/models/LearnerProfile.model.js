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
    totalCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    levelName: {
      type: String,
      default: 'Basic/Foundation',
    },
    education: {
      type: [{
        degree: String,
        institution: String,
        year: String,
        fieldOfStudy: String,
      }],
      default: [],
    },
    experience: {
      type: [{
        role: String,
        company: String,
        duration: String,
        description: String,
      }],
      default: [],
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
