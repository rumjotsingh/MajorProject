import mongoose from 'mongoose';

const nsqfMappingSchema = new mongoose.Schema(
  {
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential',
    },
    skill: {
      type: String,
    },
    nsqfLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    stackableNext: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Credential',
      default: [],
    },
    recommendedCourses: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

nsqfMappingSchema.index({ nsqfLevel: 1 });
nsqfMappingSchema.index({ skill: 1 });

export default mongoose.model('NSQFMapping', nsqfMappingSchema);
