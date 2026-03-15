import mongoose from "mongoose";

const pathwaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pathway name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Pathway description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Technology",
        "Business",
        "Healthcare",
        "Engineering",
        "Arts",
        "Science",
        "Other",
      ],
      default: "Other",
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      default: null,
    },
    isGlobal: {
      type: Boolean,
      default: true,
    },
    levels: [
      {
        level: {
          type: Number,
          required: true,
          min: 1,
          max: 10,
        },
        requiredCredits: {
          type: Number,
          required: true,
          min: 0,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
      },
    ],
    totalLevels: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Ensure levels are sorted
pathwaySchema.pre("save", function (next) {
  if (this.levels && this.levels.length > 0) {
    this.levels.sort((a, b) => a.level - b.level);
  }

  this.isGlobal = !this.instituteId;
  next();
});

// Index for faster queries
pathwaySchema.index({ name: 1 });
pathwaySchema.index({ category: 1 });
pathwaySchema.index({ isActive: 1 });
pathwaySchema.index({ instituteId: 1, isActive: 1 });
pathwaySchema.index({ isGlobal: 1, isActive: 1 });

const Pathway = mongoose.model("Pathway", pathwaySchema);

export default Pathway;
