import bcrypt from "bcryptjs";

const emailField = {
  type: String,
  required: [true, "Email is required"],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
};

const passwordField = {
  type: String,
  required: [true, "Password is required"],
  minlength: 8,
  select: false,
};

const buildBaseUserFields = (role) => ({
  email: emailField,
  password: passwordField,
  role: {
    type: String,
    enum: ["learner", "institute", "employer", "admin"],
    default: role,
  },
  instituteId: {
    type: String,
    default: null,
  },
  instituteStatus: {
    type: String,
    enum: ["not_joined", "pending", "joined"],
    default: "not_joined",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: role !== "institute",
  },
  refreshToken: {
    type: String,
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  deletedBy: {
    type: String,
    default: null,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspendedAt: Date,
  suspendedBy: {
    type: String,
    default: null,
  },
  suspensionReason: String,
  fraudFlags: {
    type: Number,
    default: 0,
  },
  isFraudulent: {
    type: Boolean,
    default: false,
  },
  fraudReason: String,
  lastIpAddress: String,
  lastUserAgent: String,
});

const applyAuthMethods = (schema) => {
  schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });

  schema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  schema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  };

  schema.methods.incLoginAttempts = function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000;

    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
      updates.$set = { lockUntil: Date.now() + lockTime };
    }

    return this.updateOne(updates);
  };

  schema.methods.resetLoginAttempts = function () {
    return this.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 },
    });
  };

  schema.index({ instituteId: 1 });
  schema.index({ instituteStatus: 1 });
};

export { applyAuthMethods, buildBaseUserFields };
