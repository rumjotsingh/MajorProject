import mongoose from "mongoose";

const learnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
      unique: true,
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    totalCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrolledPathway: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pathway",
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    profilePicture: {
      type: String,
      default: "",
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
learnerProfileSchema.index({ userId: 1 });
learnerProfileSchema.index({ currentLevel: 1 });
learnerProfileSchema.index({ enrolledPathway: 1 });

const LearnerProfile = mongoose.model("LearnerProfile", learnerProfileSchema);

export default LearnerProfile;
