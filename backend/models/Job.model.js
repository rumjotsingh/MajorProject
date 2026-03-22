import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: [{
      type: String,
      trim: true,
    }],
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      default: 'onsite',
    },
    salaryRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time',
    },
    experience: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'filled'],
      default: 'draft',
    },
    applicationDeadline: {
      type: Date,
    },
    totalApplications: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ employerId: 1, status: 1 });
jobSchema.index({ nsqfLevel: 1, location: 1 });

export default mongoose.model('Job', jobSchema);
