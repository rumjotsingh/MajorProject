import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
employerSchema.index({ companyName: 'text', description: 'text', location: 'text' });

export default mongoose.model('Employer', employerSchema);
