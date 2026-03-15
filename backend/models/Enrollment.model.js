import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
      index: true,
    },
    pathwayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pathway",
      required: true,
      index: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ learnerId: 1, pathwayId: 1 }, { unique: true });
enrollmentSchema.index({ learnerId: 1, status: 1 });
enrollmentSchema.index({ pathwayId: 1, status: 1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
