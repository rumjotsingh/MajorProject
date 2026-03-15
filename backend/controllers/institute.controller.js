import Credential from "../models/Credential.model.js";
import LearnerProfile from "../models/LearnerProfile.model.js";
import Pathway from "../models/Pathway.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Learner from "../models/Learner.model.js";
import { updateLearnerLevel } from "../utils/calculateLevel.js";
import {
  notifyCredentialVerified,
  notifyCredentialRejected,
} from "../utils/notification.util.js";

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ==============================================================================
// CREDENTIAL MANAGEMENT
// ==============================================================================

/**
 * Get all credentials issued by this institution
 */
export const getIssuedCredentials = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const status = req.query.status;
    const search = req.query.search;

    const query = { institutionId: req.user.userId };
    if (status) {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const [total, credentials] = await Promise.all([
      Credential.countDocuments(query),
      Credential.find(query)
        .populate("learnerId", "email firstName lastName")
        .populate("pathwayId", "name category")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: credentials,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
 * Get pending credentials for verification
 */
export const getPendingCredentials = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = {
      institutionId: req.user.userId,
      verificationStatus: "pending",
    };

    const [total, credentials] = await Promise.all([
      Credential.countDocuments(filter),
      Credential.find(filter)
        .populate("learnerId", "email firstName lastName")
        .populate("pathwayId", "name category")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: credentials,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
 * Verify a credential
 * THIS IS THE KEY FUNCTION THAT TRIGGERS LEVEL PROGRESSION
 */
export const verifyCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { remarks, force = false } = req.body;

    const credential = await Credential.findById(credentialId).populate(
      "pathwayId",
      "name category"
    );

    if (!credential) {
      return res.status(404).json({
        success: false,
        message:
          "Credential not found or you do not have permission to verify it",
      });
    }

    // Check if this institute owns the credential
    if (
      credential.institutionId.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this credential",
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
    credential.verifiedAt = new Date();
    credential.verificationDate = new Date();
    credential.verifiedBy = req.user.userId;
    credential.rejectedBy = null;
    credential.rejectedAt = null;
    credential.rejectionReason = null;
    if (remarks) {
      credential.remarks = remarks;
    }
    await credential.save();

    const profile = await LearnerProfile.findOne({
      userId: credential.learnerId,
    });

    if (profile) {
      profile.verifiedCredits += credential.credits;
      await profile.save();

      // TRIGGER LEVEL PROGRESSION
      await updateLearnerLevel(credential.learnerId);
    }

    // Send notification to learner
    try {
      await notifyCredentialVerified(req.io, {
        learnerId: credential.learnerId,
        institutionId: req.user.userId,
        title: credential.title,
        credentialId: credential._id,
      });
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Credential verified successfully",
      data: credential,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject a credential
 */
export const rejectCredential = async (req, res) => {
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
      "name category"
    );

    if (!credential) {
      return res.status(404).json({
        success: false,
        message:
          "Credential not found or you do not have permission to reject it",
      });
    }

    // Check if this institute owns the credential
    if (
      credential.institutionId.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this credential",
      });
    }

    if (
      !force &&
      ["approved", "verified"].includes(credential.verificationStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot reject an already verified credential",
      });
    }

    credential.verificationStatus = "rejected";
    credential.status = "rejected";
    credential.verificationDate = new Date();
    credential.rejectedAt = new Date();
    credential.rejectedBy = req.user.userId;
    credential.rejectionReason = reason;
    await credential.save();

    // Send notification to learner
    try {
      await notifyCredentialRejected(req.io, {
        learnerId: credential.learnerId,
        institutionId: req.user.userId,
        title: credential.title,
        credentialId: credential._id,
        reason,
      });
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Credential rejected",
      data: credential,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get credential statistics for institution
 */
export const getCredentialStats = async (req, res) => {
  try {
    const total = await Credential.countDocuments({
      institutionId: req.user.userId,
    });

    const verified = await Credential.countDocuments({
      institutionId: req.user.userId,
      status: "approved",
    });

    const pending = await Credential.countDocuments({
      institutionId: req.user.userId,
      verificationStatus: "pending",
    });

    const rejected = await Credential.countDocuments({
      institutionId: req.user.userId,
      verificationStatus: "rejected",
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        verified,
        pending,
        rejected,
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
 * Get dashboard data for institution
 */
export const getDashboard = async (req, res) => {
  try {
    const total = await Credential.countDocuments({
      institutionId: req.user.userId,
    });

    const verified = await Credential.countDocuments({
      institutionId: req.user.userId,
      status: "approved",
    });

    const pending = await Credential.countDocuments({
      institutionId: req.user.userId,
      verificationStatus: "pending",
    });

    const rejected = await Credential.countDocuments({
      institutionId: req.user.userId,
      verificationStatus: "rejected",
    });

    const recentCredentials = await Credential.find({
      institutionId: req.user.userId,
    })
      .populate("learnerId", "email name")
      .sort("-createdAt")
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          verified,
          pending,
          rejected,
        },
        recentCredentials,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInstituteLearners = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search;

    const userFilter = {
      role: "learner",
      instituteId: req.user.userId,
      isDeleted: { $ne: true },
    };

    if (search) {
      userFilter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const [total, learners] = await Promise.all([
      Learner.countDocuments(userFilter),
      Learner.find(userFilter)
        .select("email firstName lastName instituteId createdAt")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
    ]);

    const learnerIds = learners.map((item) => item._id);
    const enrollmentCounts = await Enrollment.aggregate([
      {
        $match: {
          learnerId: { $in: learnerIds },
          status: "active",
        },
      },
      {
        $group: {
          _id: "$learnerId",
          activePathways: { $sum: 1 },
        },
      },
    ]);

    const enrollmentMap = new Map(
      enrollmentCounts.map((item) => [
        item._id.toString(),
        item.activePathways,
      ]),
    );

    return res.status(200).json({
      success: true,
      data: {
        results: learners.map((learner) => ({
          ...learner.toObject(),
          activePathways: enrollmentMap.get(learner._id.toString()) || 0,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================================================
// PATHWAY MANAGEMENT
// ==============================================================================

export const getPathways = async (req, res) => {
  try {
    const pathways = await Pathway.find({
      instituteId: req.user.userId,
      isDeleted: { $ne: true },
    }).sort("-createdAt");

    res.status(200).json({
      success: true,
      data: pathways,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPathway = async (req, res) => {
  try {
    const { name, description, category, levels, totalLevels } = req.body;

    if (!name || !description || !levels || levels.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and levels are required",
      });
    }

    // Check if pathway with same name already exists for this institute
    const existing = await Pathway.findOne({
      instituteId: req.user.userId,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A pathway with this name already exists",
      });
    }

    const pathway = await Pathway.create({
      name,
      description,
      category: category || "Other",
      instituteId: req.user.userId,
      isGlobal: false,
      levels,
      totalLevels: totalLevels || levels.length,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Pathway created successfully",
      data: pathway,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePathway = async (req, res) => {
  try {
    const { pathwayId } = req.params;
    const updates = req.body;

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      instituteId: req.user.userId,
    });

    if (!pathway) {
      return res.status(404).json({
        success: false,
        message: "Pathway not found",
      });
    }

    // Don't allow changing instituteId or isGlobal
    delete updates.instituteId;
    delete updates.isGlobal;

    Object.assign(pathway, updates);
    await pathway.save();

    res.status(200).json({
      success: true,
      message: "Pathway updated successfully",
      data: pathway,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePathway = async (req, res) => {
  try {
    const { pathwayId } = req.params;

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      instituteId: req.user.userId,
    });

    if (!pathway) {
      return res.status(404).json({
        success: false,
        message: "Pathway not found",
      });
    }

    // Check if any learners are enrolled
    const enrolledCount = await Enrollment.countDocuments({
      pathwayId,
      status: "active",
    });

    if (enrolledCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete pathway with ${enrolledCount} active enrollments. Deactivate it instead.`,
      });
    }

    await pathway.deleteOne();

    res.status(200).json({
      success: true,
      message: "Pathway deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
