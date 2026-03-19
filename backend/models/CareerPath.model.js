import mongoose from 'mongoose';

const careerPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    nsqfLevelRange: {
      min: {
        type: Number,
        min: 1,
        max: 10,
        default: 1,
      },
      max: {
        type: Number,
        min: 1,
        max: 10,
        default: 10,
      },
    },
    averageSalary: {
      type: String,
      default: '',
    },
    growthRate: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Expert'],
      default: 'Entry',
    },
  },
  {
    timestamps: true,
  }
);

careerPathSchema.index({ requiredSkills: 1 });
careerPathSchema.index({ nsqfLevelRange: 1 });

export default mongoose.model('CareerPath', careerPathSchema);
