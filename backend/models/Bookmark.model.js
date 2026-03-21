import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
      index: true,
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notes: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    folder: {
      type: String,
      default: 'default',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate bookmarks
bookmarkSchema.index({ employerId: 1, learnerId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
