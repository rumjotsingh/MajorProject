import mongoose from "mongoose";
import { applyAuthMethods, buildBaseUserFields } from "./userSchema.shared.js";

const learnerSchema = new mongoose.Schema(
  {
    ...buildBaseUserFields("learner"),
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
      },
    ],
    credentials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Credential",
      },
    ],
    isClaimed: {
      type: Boolean,
      default: false,
    },
    claimedBy: {
      type: String,
      default: null,
    },
    claimedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "learners",
  },
);

applyAuthMethods(learnerSchema);

const Learner = mongoose.model("Learner", learnerSchema);

export default Learner;
