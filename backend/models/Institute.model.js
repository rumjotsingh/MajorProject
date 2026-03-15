import mongoose from "mongoose";
import { applyAuthMethods, buildBaseUserFields } from "./userSchema.shared.js";

const generateInstituteCode = (name = "") => {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${suffix}`;
};

const instituteSchema = new mongoose.Schema(
  {
    ...buildBaseUserFields("institute"),
    instituteName: {
      type: String,
      required: [true, "Institute name is required"],
      trim: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null values for external institutions
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
      index: true, // For faster lookups
    },
    university: {
      type: String,
      trim: true,
    },
    instituteType: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ["registered", "external_api", "learner_created"],
      default: "registered",
    },
    createdBy: {
      type: String,
      default: null,
    },
    contactPerson: {
      name: {
        type: String,
      },
      designation: String,
      phone: {
        type: String,
      },
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    website: {
      type: String,
      trim: true,
    },
    accreditation: [
      {
        body: String,
        certificateNumber: String,
        validUntil: Date,
      },
    ],
    documents: [
      {
        type: {
          type: String,
          enum: ["registration", "accreditation", "authorization"],
        },
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: String,
    credentialsIssued: {
      type: Number,
      default: 0,
    },
    instituteCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "institutes",
  },
);

instituteSchema.pre("validate", function (next) {
  if (!this.instituteCode) {
    this.instituteCode = generateInstituteCode(
      this.instituteName || this.email || "INST",
    );
  }
  next();
});

applyAuthMethods(instituteSchema);

const Institute = mongoose.model("Institute", instituteSchema);

export default Institute;
