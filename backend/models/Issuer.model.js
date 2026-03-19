import mongoose from 'mongoose';
import crypto from 'crypto';

const issuerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(32).toString('hex'),
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
    mobile: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Issuer', issuerSchema);
