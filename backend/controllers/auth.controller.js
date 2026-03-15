import crypto from "crypto";
import Learner from "../models/Learner.model.js";
import Institute from "../models/Institute.model.js";
import Employer from "../models/Employer.model.js";
import {
  emailExistsAcrossRoles,
  findUserByEmailAcrossRoles,
  findUserByIdAcrossRoles,
  findUserByRefreshToken,
  getModelForRole,
} from "../utils/userModel.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util.js";
import { sendEmail } from "../utils/email.util.js";

/**
 * Register a new user
 * Creates user immediately without email verification
 */
const register = async (req, res) => {
  try {
    const { email, password, role, ...additionalData } = req.body;

    // Prevent admin registration via API
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin registration is not allowed",
      });
    }

    const existingUser = await emailExistsAcrossRoles(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    let user;
    const baseData = { email, password, role, isActive: true };

    switch (role) {
      case "learner":
        let instituteId = null;
        let instituteStatus = "not_joined";

        const requestedInstituteCode = additionalData.instituteCode?.trim();
        const requestedInstituteName = additionalData.instituteName?.trim();

        if (requestedInstituteCode || requestedInstituteName) {
          let existingInstitute = null;

          if (requestedInstituteCode) {
            existingInstitute = await Institute.findOne({
              instituteCode: requestedInstituteCode.toUpperCase(),
              isDeleted: { $ne: true },
            });
          }

          if (!existingInstitute && requestedInstituteName) {
            existingInstitute = await Institute.findOne({
              instituteName: {
                $regex: new RegExp(`^${requestedInstituteName}$`, "i"),
              },
              isDeleted: { $ne: true },
            });
          }

          if (existingInstitute) {
            instituteId = existingInstitute._id;
            instituteStatus =
              existingInstitute.approvalStatus === "approved" &&
              existingInstitute.isActive
                ? "joined"
                : "pending";
          } else if (requestedInstituteName) {
            const generatedEmail = `${requestedInstituteName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, ".")
              .replace(/^\.|\.$/g, "")}.${Date.now()}@temp.edu`;

            const createdInstitute = await Institute.create({
              email: generatedEmail,
              password: Math.random().toString(36).slice(-12),
              instituteName: requestedInstituteName,
              source: "learner_created",
              approvalStatus: "pending",
              isApproved: false,
              contactPerson: {
                name:
                  `${additionalData.firstName || ""} ${additionalData.lastName || ""}`.trim() ||
                  undefined,
                phone: additionalData.phone,
              },
            });

            instituteId = createdInstitute._id;
            instituteStatus = "pending";
          }
        }

        user = await Learner.create({
          ...baseData,
          firstName: additionalData.firstName,
          lastName: additionalData.lastName,
          phone: additionalData.phone,
          instituteId,
          instituteStatus,
        });
        break;
      case "institute":
        user = await Institute.create({
          ...baseData,
          instituteName: additionalData.instituteName,
          registrationNumber: additionalData.registrationNumber,
          contactPerson: additionalData.contactPerson,
          address: additionalData.address,
          website: additionalData.website,
          isApproved: false, // Institutes require approval
        });
        break;
      case "employer":
        user = await Employer.create({
          ...baseData,
          companyName: additionalData.companyName,
          industry: additionalData.industry,
          contactPerson: additionalData.contactPerson,
          address: additionalData.address,
          website: additionalData.website,
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
    }

    // Generate tokens immediately
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          instituteId: user.instituteId || null,
          instituteStatus: user.instituteStatus || "not_joined",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmailAcrossRoles(
      email,
      "+password +refreshToken",
    );

    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isLocked()) {
      const lockTimeRemaining = Math.ceil(
        (user.lockUntil - Date.now()) / 1000 / 60,
      );
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account is suspended. Reason: ${user.suspensionReason || "Contact support"}`,
      });
    }

    await user.resetLoginAttempts();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.lastIpAddress = req.ip;
    user.lastUserAgent = req.get("user-agent");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          instituteId: user.instituteId || null,
          instituteStatus: user.instituteStatus || "not_joined",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Forgot Password
 * Generates secure reset token and sends email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Always return success to prevent email enumeration
    const successResponse = () => {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    };

    const user = await findUserByEmailAcrossRoles(email);

    if (!user || user.isDeleted || !user.isActive) {
      return successResponse();
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Store hashed token with 15 minute expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">For security, this link can only be used once.</p>
        `,
      });
    } catch (emailError) {
      // Clear token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }

    return successResponse();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reset Password
 * Validates token and updates password
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let user = null;
    const roleModels = ["admin", "learner", "institute", "employer"];
    for (const role of roleModels) {
      const model = getModelForRole(role);
      user = await model
        .findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: Date.now() },
          isDeleted: { $ne: true },
        })
        .select("+resetPasswordToken +resetPasswordExpires");
      if (user) break;
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Reset login attempts on password change
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // Invalidate all sessions by clearing refresh token
    user.refreshToken = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Refresh Access Token
 * Implements token rotation for security
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await findUserByIdAcrossRoles(decoded.userId, "+refreshToken");

    if (!user) {
      const fallbackByToken = await findUserByRefreshToken(
        refreshToken,
        "+refreshToken",
      );
      if (!fallbackByToken) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (!fallbackByToken.isActive || fallbackByToken.isSuspended) {
        return res.status(403).json({
          success: false,
          message: "Account is not active",
        });
      }

      const newAccessToken = generateAccessToken(
        fallbackByToken._id,
        fallbackByToken.role,
      );
      const newRefreshToken = generateRefreshToken(fallbackByToken._id);

      fallbackByToken.refreshToken = newRefreshToken;
      await fallbackByToken.save();

      return res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    }

    // Check if token matches stored token (prevents reuse)
    if (user.refreshToken !== refreshToken) {
      // Possible token theft - clear all tokens
      user.refreshToken = undefined;
      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please login again.",
      });
    }

    if (!user.isActive || user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    // Generate new tokens (rotation)
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update stored refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Logout
 * Clears refresh token
 */
const logout = async (req, res) => {
  try {
    const user = await findUserByIdAcrossRoles(
      req.user.userId,
      "+refreshToken",
    );

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    const user = await findUserByIdAcrossRoles(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  getMe,
};
