import Enrollment from "../models/Enrollment.model.js";
import Pathway from "../models/Pathway.model.js";
import {
  findUserByIdAcrossRoles,
  getModelForRole,
} from "../utils/userModel.util.js";
// import { createOTP, verifyOTP } from "../utils/otp.util.js";
// import { sendOTPEmail } from "../utils/email.util.js";

const getProfile = async (req, res) => {
  try {
    const user = await findUserByIdAcrossRoles(
      req.user.userId,
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates.isApproved;

    const existingUser = await findUserByIdAcrossRoles(req.user.userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleModel = getModelForRole(existingUser.role);
    const user = await roleModel
      .findByIdAndUpdate(
        req.user.userId,
        { $set: updates },
        { new: true, runValidators: true },
      )
      .select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await findUserByIdAcrossRoles(req.user.userId, "+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPathwayData = async (req, res) => {
  try {
    const user = await findUserByIdAcrossRoles(
      req.user.userId,
      "role instituteId",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const pathwayQuery = { isActive: true };
    if (user.role === "learner") {
      pathwayQuery.$or = [{ isGlobal: true }];
      if (user.instituteId) {
        pathwayQuery.$or.push({ instituteId: user.instituteId });
      }
    }

    const [enrollments, pathways] = await Promise.all([
      Enrollment.find({ learnerId: req.user.userId, status: "active" })
        .populate("pathwayId", "name category description isGlobal instituteId")
        .sort("-createdAt"),
      Pathway.find(pathwayQuery)
        .select("name category description isGlobal instituteId isActive")
        .sort("name"),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        enrollments,
        pathways,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const claimAccount = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const learner = await Learner.findOne({ email, isClaimed: false });

//     if (!learner) {
//       return res.status(404).json({
//         success: false,
//         message: 'No unclaimed account found with this email'
//       });
//     }

//     const verification = await verifyOTP(email, otp, 'account_claim');

//     if (!verification.valid) {
//       return res.status(400).json({
//         success: false,
//         message: verification.message
//       });
//     }

//     learner.isClaimed = true;
//     learner.claimedBy = req.user.userId;
//     learner.claimedAt = new Date();
//     await learner.save();

//     res.status(200).json({
//       success: true,
//       message: 'Account claimed successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// const requestAccountClaim = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const learner = await Learner.findOne({ email, isClaimed: false });

//     if (!learner) {
//       return res.status(404).json({
//         success: false,
//         message: "No unclaimed account found with this email",
//       });
//     }

//     const otp = await createOTP(email, "account_claim");
//     await sendOTPEmail(email, otp, "account_claim");

//     res.status(200).json({
//       success: true,
//       message: "OTP sent to your email for account claim verification",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export { getProfile, updateProfile, changePassword, getPathwayData };
