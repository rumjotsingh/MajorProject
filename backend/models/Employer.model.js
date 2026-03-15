import mongoose from "mongoose";
import { applyAuthMethods, buildBaseUserFields } from "./userSchema.shared.js";

const employerSchema = new mongoose.Schema(
  {
    ...buildBaseUserFields("employer"),
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
    },
    contactPerson: {
      name: {
        type: String,
        required: true,
      },
      designation: String,
      phone: {
        type: String,
        required: true,
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
    verifiedCredentials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Credential",
      },
    ],
  },
  {
    timestamps: true,
    collection: "employers",
  },
);

applyAuthMethods(employerSchema);

const Employer = mongoose.model("Employer", employerSchema);

export default Employer;
