import mongoose from "mongoose";

const credentialSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
    },
    pathwayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pathway",
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Credential title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    nsqLevel: {
      type: Number,
      required: [true, "NSQ level is required"],
      min: 1,
      max: 10,
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: 0,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "verified"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    claimStatus: {
      type: String,
      enum: ["claimed", "unclaimed"],
      default: "unclaimed",
    },
    certificateUrl: {
      type: String,
      trim: true,
    },
    certificateNumber: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    verificationDate: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

credentialSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status) {
    this.verificationStatus =
      this.status === "approved" ? "verified" : this.status;
  }

  if (this.isModified("verificationStatus") && this.verificationStatus) {
    if (this.verificationStatus === "verified") {
      this.status = "approved";
    } else {
      this.status = this.verificationStatus;
    }
  }

  next();
});

// Indexes for faster queries
credentialSchema.index({ learnerId: 1, createdAt: -1 });
credentialSchema.index({ learnerId: 1, pathwayId: 1, createdAt: -1 });
credentialSchema.index({ institutionId: 1 });
credentialSchema.index({ verificationStatus: 1 });
credentialSchema.index({ status: 1 });
credentialSchema.index({ claimStatus: 1 });
credentialSchema.index({ nsqLevel: 1 });

// Prevent duplicate credentials
credentialSchema.index(
  {
    learnerId: 1,
    title: 1,
    institutionId: 1,
    certificateNumber: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

const Credential = mongoose.model("Credential", credentialSchema);

export default Credential;
