import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'rejected', 'hired', 'withdrawn'],
      default: 'applied',
    },
    coverLetter: {
      type: String,
    },
    resume: {
      type: String, // URL to resume file
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['applied', 'shortlisted', 'interviewing', 'rejected', 'hired', 'withdrawn'],
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
    }],
    employerNotes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
applicationSchema.index({ jobId: 1, learnerId: 1 }, { unique: true });
applicationSchema.index({ employerId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ learnerId: 1, status: 1 });

// Pre-save middleware to track status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

export default mongoose.model('Application', applicationSchema);
