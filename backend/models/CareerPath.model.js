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
    // New fields
    demand: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High'],
      default: 'Medium',
    },
    jobOpenings: {
      type: Number,
      default: 0,
    },
    educationRequired: {
      type: String,
      default: '',
    },
    certifications: {
      type: [String],
      default: [],
    },
    careerProgression: {
      type: [String],
      default: [],
    },
    workEnvironment: {
      type: String,
      default: '',
    },
    keyResponsibilities: {
      type: [String],
      default: [],
    },
    tools: {
      type: [String],
      default: [],
    },
    relatedRoles: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'blue',
    },
  },
  {
    timestamps: true,
  }
);

careerPathSchema.index({ requiredSkills: 1 });
careerPathSchema.index({ nsqfLevelRange: 1 });
careerPathSchema.index({ industry: 1 });
careerPathSchema.index({ demand: 1 });

export default mongoose.model('CareerPath', careerPathSchema);
