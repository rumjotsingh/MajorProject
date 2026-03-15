import mongoose from "mongoose";
import { applyAuthMethods, buildBaseUserFields } from "./userSchema.shared.js";

const userSchema = new mongoose.Schema(buildBaseUserFields("admin"), {
  timestamps: true,
  collection: "admins",
});

applyAuthMethods(userSchema);

const User = mongoose.model("User", userSchema);

export default User;
