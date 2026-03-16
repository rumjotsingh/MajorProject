import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential',
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ['blockchain', 'issuerAPI', 'digilocker', 'manual'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    resultDetails: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Verification', verificationSchema);
