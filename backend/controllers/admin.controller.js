import User from "../models/User.model.js";
import Learner from "../models/Learner.model.js";
import Institute from "../models/Institute.model.js";
import Credential from "../models/Credential.model.js";
import Pathway from "../models/Pathway.model.js";
import LearnerProfile from "../models/LearnerProfile.model.js";
import Employer from "../models/Employer.model.js";
import Enrollment from "../models/Enrollment.model.js";
import { sendApprovalEmail } from "../utils/email.util.js";
import {
  emailExistsAcrossRoles,
  findUserByIdAcrossRoles,
  getModelForRole,
} from "../utils/userModel.util.js";
import bcrypt from "bcryptjs";

// ==============================================================================
// DASHBOARD
// ==============================================================================

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalAdmins,
      totalUsers,
      totalLearners,
      totalInstitutes,
      totalEmployers,
      pendingInstitutes,
      totalCredentials,
      verifiedCredentials,
      pendingCredentials,
      totalPathways,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      Promise.all([
        User.countDocuments({ isDeleted: { $ne: true } }),
        Learner.countDocuments({ isDeleted: { $ne: true } }),
        Institute.countDocuments({ isDeleted: { $ne: true } }),
        Employer.countDocuments({ isDeleted: { $ne: true } }),
      ]).then((counts) => counts.reduce((sum, current) => sum + current, 0)),
      Learner.countDocuments({ isDeleted: { $ne: true } }),
      Institute.countDocuments({ isDeleted: { $ne: true } }),
      Employer.countDocuments({ isDeleted: { $ne: true } }),
      Institute.countDocuments({ approvalStatus: "pending" }),
      Credential.countDocuments(),
      Credential.countDocuments({ status: "approved" }),
      Credential.countDocuments({ status: "pending" }),
      Pathway.countDocuments({ isActive: true }),
    ]);

    const recentUsersCombined = await Promise.all([
      User.find({ isDeleted: { $ne: true } })
        .select("-password -refreshToken")
        .limit(5),
      Learner.find({ isDeleted: { $ne: true } })
        .select("-password -refreshToken")
        .limit(5),
      Institute.find({ isDeleted: { $ne: true } })
        .select("-password -refreshToken")
        .limit(5),
      Employer.find({ isDeleted: { $ne: true } })
        .select("-password -refreshToken")
        .limit(5),
    ]);

    const recentUsers = recentUsersCombined
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalAdmins,
          totalUsers,
          totalLearners,
          totalInstitutes,
          totalEmployers,
          pendingInstitutes,
          totalCredentials,
          verifiedCredentials,
          pendingCredentials,
          totalPathways,
        },
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// INSTITUTE MANAGEMENT
// ==============================================================================

export const createInstitute = async (req, res) => {
  try {
    const {
      email,
      password,
      instituteName,
      institutionType,
      registrationNumber,
      address,
      website,
    } = req.body;

    const emailExists = await emailExistsAcrossRoles(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const institute = await Institute.create({
      email,
      password,
      instituteName,
      institutionType,
      registrationNumber,
      address,
      website,
      isApproved: true,
      approvalStatus: "approved",
      approvedBy: req.user.userId,
      approvedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Institute created successfully",
      data: institute,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllInstitutes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const query = { isDeleted: { $ne: true } };

    if (status && status !== "all") query.approvalStatus = status;
    if (search) {
      query.$or = [
        { instituteName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const institutes = await Institute.find(query)
      .select("-password -refreshToken")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Institute.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        institutes,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({ approvalStatus: "pending" })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: institutes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.instituteId).select(
      "-password -refreshToken",
    );
    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    const credentialCount = await Credential.countDocuments({
      institutionId: institute._id,
    });

    res.status(200).json({
      success: true,
      data: { ...institute.toObject(), credentialsIssued: credentialCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndUpdate(
      req.params.instituteId,
      req.body,
      { new: true, runValidators: true },
    ).select("-password -refreshToken");

    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Institute updated", data: institute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndUpdate(
      req.params.instituteId,
      {
        approvalStatus: "approved",
        isApproved: true,
        approvedBy: req.user.userId,
        approvedAt: new Date(),
      },
      { new: true },
    ).select("-password -refreshToken");

    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    await sendApprovalEmail(institute.email, institute.instituteName);

    res
      .status(200)
      .json({ success: true, message: "Institute approved", data: institute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectInstitute = async (req, res) => {
  try {
    const { reason } = req.body;
    const institute = await Institute.findByIdAndUpdate(
      req.params.instituteId,
      { approvalStatus: "rejected", rejectionReason: reason },
      { new: true },
    ).select("-password -refreshToken");

    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Institute rejected", data: institute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendInstitute = async (req, res) => {
  try {
    const { reason } = req.body;
    const institute = await Institute.findByIdAndUpdate(
      req.params.instituteId,
      { isSuspended: true, suspensionReason: reason },
      { new: true },
    ).select("-password -refreshToken");

    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Institute suspended", data: institute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivateInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndUpdate(
      req.params.instituteId,
      { isActive: false },
      { new: true },
    ).select("-password -refreshToken");

    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    res.status(200).json({ success: true, message: "Institute deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blockInstituteLogin = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndUpdate(
      req.params.instituteId,
      { isActive: false, isSuspended: true },
      { new: true },
    );

    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    res.status(200).json({ success: true, message: "Institute login blocked" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInstituteCredentials = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const credentials = await Credential.find({
      institutionId: req.params.instituteId,
    })
      .populate("learnerId", "email name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Credential.countDocuments({
      institutionId: req.params.instituteId,
    });

    res.status(200).json({
      success: true,
      data: {
        credentials,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndUpdate(
      req.params.instituteId,
      { isDeleted: true, isActive: false },
      { new: true },
    );

    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    res.status(200).json({ success: true, message: "Institute deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// LEARNER MANAGEMENT
// ==============================================================================

export const getAllLearners = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const query = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const learners = await Learner.find(query)
      .select("-password -refreshToken")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Learner.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        learners,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLearnerById = async (req, res) => {
  try {
    const learner = await Learner.findById(req.params.id).select(
      "-password -refreshToken",
    );
    if (!learner) {
      return res
        .status(404)
        .json({ success: false, message: "Learner not found" });
    }

    const profile = await LearnerProfile.findOne({ userId: learner._id });
    const credentialCount = await Credential.countDocuments({
      learnerId: learner._id,
    });

    res.status(200).json({
      success: true,
      data: { ...learner.toObject(), profile, credentialCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendLearner = async (req, res) => {
  try {
    const { reason } = req.body;
    const learner = await Learner.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspensionReason: reason },
      { new: true },
    ).select("-password -refreshToken");

    if (!learner) {
      return res
        .status(404)
        .json({ success: false, message: "Learner not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Learner suspended", data: learner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unsuspendLearner = async (req, res) => {
  try {
    const learner = await Learner.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspensionReason: null },
      { new: true },
    ).select("-password -refreshToken");

    if (!learner) {
      return res
        .status(404)
        .json({ success: false, message: "Learner not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Learner unsuspended", data: learner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLearner = async (req, res) => {
  try {
    const learner = await Learner.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false },
      { new: true },
    );

    if (!learner) {
      return res
        .status(404)
        .json({ success: false, message: "Learner not found" });
    }

    res.status(200).json({ success: true, message: "Learner deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLearnerCredentials = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const credentials = await Credential.find({ learnerId: req.params.id })
      .populate("institutionId", "instituteName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Credential.countDocuments({ learnerId: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        credentials,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// EMPLOYER MANAGEMENT
// ==============================================================================

export const getAllEmployers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const query = { role: "employer", isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const employers = await Employer.find(query)
      .select("-password -refreshToken")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Employer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        employers,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployerById = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id).select(
      "-password -refreshToken",
    );
    if (!employer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found" });
    }

    res.status(200).json({ success: true, data: employer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, approvedAt: new Date() },
      { new: true },
    ).select("-password -refreshToken");

    if (!employer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Employer approved", data: employer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendEmployer = async (req, res) => {
  try {
    const { reason } = req.body;
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspensionReason: reason },
      { new: true },
    ).select("-password -refreshToken");

    if (!employer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Employer suspended", data: employer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unsuspendEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspensionReason: null },
      { new: true },
    ).select("-password -refreshToken");

    if (!employer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Employer unsuspended", data: employer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false },
      { new: true },
    );

    if (!employer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found" });
    }

    res.status(200).json({ success: true, message: "Employer deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// USER MANAGEMENT
// ==============================================================================

export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const roleModelMap = {
      admin: User,
      learner: Learner,
      institute: Institute,
      employer: Employer,
    };
    const selectedRoles =
      role && roleModelMap[role] ? [role] : Object.keys(roleModelMap);

    const userGroups = await Promise.all(
      selectedRoles.map((currentRole) =>
        roleModelMap[currentRole]
          .find({ isDeleted: { $ne: true } })
          .select("-password -refreshToken"),
      ),
    );

    const allUsers = userGroups
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const users = allUsers.slice(startIndex, startIndex + Number(limit));
    const count = allUsers.length;

    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const existingUser = await findUserByIdAcrossRoles(req.params.userId);
    const roleModel = existingUser ? getModelForRole(existingUser.role) : null;
    const user = roleModel
      ? await roleModel.findByIdAndUpdate(
          req.params.userId,
          { isActive: false },
          { new: true },
        )
      : null;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// CREDENTIALS MANAGEMENT
// ==============================================================================

export const getAllCredentials = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { issuer: { $regex: search, $options: "i" } },
      ];
    }

    const credentials = await Credential.find(query)
      .populate("learnerId", "email name")
      .populate("institutionId", "instituteName email")
      .populate("pathwayId", "name category isGlobal instituteId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Credential.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        credentials,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyGlobalCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { remarks, force = false } = req.body;

    const credential = await Credential.findById(credentialId).populate(
      "pathwayId",
      "isGlobal instituteId",
    );

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    if (credential.pathwayId?.instituteId) {
      return res.status(403).json({
        success: false,
        message:
          "Institute pathway credentials must be verified by institute admin",
      });
    }

    if (
      !force &&
      ["approved", "verified"].includes(credential.verificationStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Credential is already approved",
      });
    }

    credential.verificationStatus = "verified";
    credential.status = "approved";
    credential.verifiedBy = req.user.userId;
    credential.verifiedAt = new Date();
    credential.verificationDate = new Date();
    credential.rejectedBy = null;
    credential.rejectedAt = null;
    credential.rejectionReason = null;
    credential.remarks = remarks || null;
    await credential.save();

    const profile = await LearnerProfile.findOne({
      userId: credential.learnerId,
    });
    if (profile) {
      profile.verifiedCredits += credential.credits;
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Credential approved by admin",
      data: credential,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectGlobalCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { reason, force = false } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const credential = await Credential.findById(credentialId).populate(
      "pathwayId",
      "isGlobal instituteId",
    );

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    if (credential.pathwayId?.instituteId) {
      return res.status(403).json({
        success: false,
        message:
          "Institute pathway credentials must be verified by institute admin",
      });
    }

    if (
      !force &&
      ["approved", "verified"].includes(credential.verificationStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot reject an already approved credential without force",
      });
    }

    credential.verificationStatus = "rejected";
    credential.status = "rejected";
    credential.rejectedBy = req.user.userId;
    credential.rejectedAt = new Date();
    credential.verificationDate = new Date();
    credential.rejectionReason = reason;
    await credential.save();

    return res.status(200).json({
      success: true,
      message: "Credential rejected by admin",
      data: credential,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// PATHWAY MANAGEMENT
// ==============================================================================

export const getAllPathways = async (req, res) => {
  try {
    const pathways = await Pathway.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: pathways });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPathway = async (req, res) => {
  try {
    const { name, description, category, icon, levels, instituteId } = req.body;

    const existing = await Pathway.findOne({ name });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Pathway name already exists" });
    }

    const pathway = await Pathway.create({
      name,
      description,
      category,
      icon,
      levels,
      instituteId: instituteId || null,
      isGlobal: !instituteId,
    });
    res
      .status(201)
      .json({ success: true, message: "Pathway created", data: pathway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePathway = async (req, res) => {
  try {
    const pathway = await Pathway.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pathway) {
      return res
        .status(404)
        .json({ success: false, message: "Pathway not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Pathway updated", data: pathway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePathwayStatus = async (req, res) => {
  try {
    const pathway = await Pathway.findById(req.params.id);
    if (!pathway) {
      return res
        .status(404)
        .json({ success: false, message: "Pathway not found" });
    }

    pathway.isActive = !pathway.isActive;
    await pathway.save();

    res.status(200).json({
      success: true,
      message: `Pathway ${pathway.isActive ? "activated" : "deactivated"}`,
      data: pathway,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePathway = async (req, res) => {
  try {
    const enrolledCount = await Enrollment.countDocuments({
      pathwayId: req.params.id,
      status: "active",
    });
    if (enrolledCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${enrolledCount} learner(s) enrolled.`,
      });
    }

    const pathway = await Pathway.findByIdAndDelete(req.params.id);
    if (!pathway) {
      return res
        .status(404)
        .json({ success: false, message: "Pathway not found" });
    }

    res.status(200).json({ success: true, message: "Pathway deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// EMPLOYER ACTIVITY & VERIFICATIONS
// ==============================================================================

export const getEmployerActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    // Mock activity data - replace with actual activity tracking when implemented
    const activities = [
      {
        id: 1,
        type: "verification",
        action: "Verified credential",
        credentialTitle: "Bachelor of Computer Science",
        learnerName: "John Doe",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: "completed",
      },
      {
        id: 2,
        type: "login",
        action: "Logged in",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        status: "success",
      },
      {
        id: 3,
        type: "verification",
        action: "Verified credential",
        credentialTitle: "Data Science Certificate",
        learnerName: "Jane Smith",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: "completed",
      },
    ];

    const total = activities.length;
    const startIndex = (page - 1) * limit;
    const paginatedActivities = activities.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      data: {
        activities: paginatedActivities,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployerVerifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    // Mock verification data - replace with actual verification tracking when implemented
    const verifications = [
      {
        id: 1,
        credentialTitle: "Bachelor of Computer Science",
        learnerName: "John Doe",
        learnerId: "507f1f77bcf86cd799439011",
        instituteName: "MIT",
        verifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "verified",
        result: "authentic",
      },
      {
        id: 2,
        credentialTitle: "Data Science Certificate",
        learnerName: "Jane Smith",
        learnerId: "507f1f77bcf86cd799439012",
        instituteName: "Stanford University",
        verifiedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: "verified",
        result: "authentic",
      },
      {
        id: 3,
        credentialTitle: "MBA",
        learnerName: "Bob Johnson",
        learnerId: "507f1f77bcf86cd799439013",
        instituteName: "Harvard Business School",
        verifiedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        status: "verified",
        result: "authentic",
      },
    ];

    const filteredVerifications = status
      ? verifications.filter((v) => v.status === status)
      : verifications;

    const total = filteredVerifications.length;
    const startIndex = (page - 1) * limit;
    const paginatedVerifications = filteredVerifications.slice(
      startIndex,
      startIndex + Number(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        verifications: paginatedVerifications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
