import mongoose from 'mongoose';
import crypto from 'crypto';

const issuerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    allowedDomains: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },
    contactEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate API key before saving
issuerSchema.pre('save', function (next) {
  if (!this.apiKey) {
    this.apiKey = crypto.randomBytes(32).toString('hex');
  }
  next();
});

export default mongoose.model('Issuer', issuerSchema);
