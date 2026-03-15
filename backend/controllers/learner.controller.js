import LearnerProfile from "../models/LearnerProfile.model.js";
import Credential from "../models/Credential.model.js";
import Pathway from "../models/Pathway.model.js";
import Learner from "../models/Learner.model.js";
import Institute from "../models/Institute.model.js";
import Enrollment from "../models/Enrollment.model.js";
import {
  updateLearnerLevel,
  getLevelProgress,
} from "../utils/calculateLevel.js";
import { searchColleges } from "../utils/collegeApi.util.js";
import { notifyCredentialUploaded } from "../utils/notification.util.js";

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ==============================================================================
// PROFILE MANAGEMENT
// ==============================================================================

export const getProfile = async (req, res) => {
  try {
    let profile = await LearnerProfile.findOne({
      userId: req.user.userId,
    }).populate("enrolledPathway", "name description category");

    if (!profile) {
      profile = await LearnerProfile.create({
        userId: req.user.userId,
      });
    }

    const user = await Learner.findById(req.user.userId).select(
      "-password -refreshToken",
    );

    const [institute, enrollments] = await Promise.all([
      user?.instituteId
        ? Institute.findById(user.instituteId).select(
            "_id instituteName instituteCode approvalStatus isActive",
          )
        : null,
      Enrollment.find({ learnerId: req.user.userId, status: "active" })
        .populate("pathwayId", "_id name description category isActive")
        .sort("-createdAt"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
        institute,
        enrollments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, skills, location, socialLinks, profilePicture } = req.body;

    let profile = await LearnerProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      profile = await LearnerProfile.create({
        userId: req.user.userId,
        bio,
        skills,
        location,
        socialLinks,
        profilePicture,
      });
    } else {
      if (bio !== undefined) profile.bio = bio;
      if (skills !== undefined) profile.skills = skills;
      if (location !== undefined) profile.location = location;
      if (socialLinks !== undefined) profile.socialLinks = socialLinks;
      if (profilePicture !== undefined) profile.profilePicture = profilePicture;

      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const profile = await LearnerProfile.findOne({
      userId: req.user.userId,
    }).populate("enrolledPathway", "name description");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const levelProgress = await getLevelProgress(req.user.userId);

    const recentCredentials = await Credential.find({
      learnerId: req.user.userId,
    })
      .sort("-createdAt")
      .limit(5)
      .populate("institutionId", "instituteName email");

    const totalCredentials = await Credential.countDocuments({
      learnerId: req.user.userId,
    });
    const verifiedCredentials = await Credential.countDocuments({
      learnerId: req.user.userId,
      status: "approved",
    });
    const pendingCredentials = await Credential.countDocuments({
      learnerId: req.user.userId,
      verificationStatus: "pending",
    });

    res.status(200).json({
      success: true,
      data: {
        profile: {
          currentLevel: profile.currentLevel,
          totalCredits: profile.totalCredits,
          verifiedCredits: profile.verifiedCredits,
          enrolledPathway: profile.enrolledPathway,
        },
        levelProgress,
        stats: {
          totalCredentials,
          verifiedCredentials,
          pendingCredentials,
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

// ==============================================================================
// INSTITUTIONS
// ==============================================================================

export const joinInstitute = async (req, res) => {
  try {
    const { instituteCode, allowTransfer = false } = req.body;

    if (!instituteCode) {
      return res.status(400).json({
        success: false,
        message: "Institute code is required",
      });
    }

    const institute = await Institute.findOne({
      instituteCode: instituteCode.toUpperCase(),
      approvalStatus: "approved",
      isActive: true,
      isDeleted: { $ne: true },
    }).select("_id instituteName instituteCode approvalStatus isActive");

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found or inactive",
      });
    }

    const learner = await Learner.findById(req.user.userId).select(
      "instituteId instituteStatus",
    );

    if (learner?.instituteId?.toString() === institute._id.toString()) {
      return res.status(200).json({
        success: true,
        message: "Already joined this institute",
        data: institute,
      });
    }

    if (learner?.instituteId && !allowTransfer) {
      return res.status(400).json({
        success: false,
        message:
          "You are already linked to an institute. Set allowTransfer=true to switch institutes.",
      });
    }

    if (learner?.instituteId && allowTransfer) {
      const activeInstituteEnrollments = await Enrollment.countDocuments({
        learnerId: req.user.userId,
        status: "active",
        instituteId: { $ne: null },
      });

      if (activeInstituteEnrollments > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot transfer institute while active institute pathway enrollments exist.",
        });
      }
    }

    await Learner.findByIdAndUpdate(req.user.userId, {
      instituteId: institute._id,
      instituteStatus: "joined",
    });

    return res.status(200).json({
      success: true,
      message: learner?.instituteId
        ? "Institute transferred successfully"
        : "Institute joined successfully",
      data: institute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInstitutions = async (req, res) => {
  try {
    const institutions = await Institute.find({
      approvalStatus: "approved",
      isActive: true,
      isDeleted: { $ne: true },
    }).select("_id instituteName email website address.city address.state instituteCode");

    res.status(200).json({
      success: true,
      data: institutions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchInstitutions = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 3 characters to search",
      });
    }

    const searchTerm = keyword.trim();

    const internalInstitutions = await Institute.find({
      approvalStatus: "approved",
      isActive: true,
      isDeleted: { $ne: true },
      instituteName: { $regex: new RegExp(searchTerm, "i") },
    })
      .select(
        "_id instituteName email website address.city address.state address.district university source instituteCode",
      )
      .limit(10);

    let externalInstitutions = [];
    try {
      const apiResults = await searchColleges(searchTerm);
      externalInstitutions = apiResults.slice(0, 10);
    } catch (error) {
      console.error("External API search failed:", error.message);
    }

    const combinedResults = {
      internal: internalInstitutions.map((inst) => ({
        _id: inst._id,
        instituteName: inst.instituteName,
        email: inst.email,
        website: inst.website,
        city: inst.address?.city,
        state: inst.address?.state,
        district: inst.address?.district,
        university: inst.university,
        source: inst.source || "registered",
        instituteCode: inst.instituteCode,
        verified: true,
      })),
      external: externalInstitutions.map((inst) => ({
        externalId: inst.externalId,
        instituteName: inst.collegeName,
        university: inst.university,
        type: inst.type,
        state: inst.state,
        district: inst.district,
        source: "external_api",
        verified: false,
      })),
    };

    res.status(200).json({
      success: true,
      data: combinedResults,
      message: `Found ${combinedResults.internal.length} verified and ${combinedResults.external.length} unverified institutions`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createInstitutionFromExternal = async (req, res) => {
  try {
    const { instituteName, university, type, state, district, externalId } =
      req.body;

    if (!instituteName) {
      return res.status(400).json({
        success: false,
        message: "Institution name is required",
      });
    }

    const existing = await Institute.findOne({
      instituteName: { $regex: new RegExp(`^${instituteName}$`, "i") },
      "address.state": state,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        message: "Institution already exists in our database",
        alreadyExists: true,
      });
    }

    const newInstitution = await Institute.create({
      email: `${instituteName.toLowerCase().replace(/\s+/g, ".")}@temp.edu`,
      password: Math.random().toString(36).slice(-12),
      instituteName,
      university,
      instituteType: type,
      externalId,
      address: {
        state,
        district,
        country: "India",
      },
      source: "external_api",
      approvalStatus: "pending",
      createdBy: req.user.userId,
      emailVerified: false,
    });

    res.status(201).json({
      success: true,
      data: newInstitution,
      message: "Institution created successfully. Pending admin verification.",
      alreadyExists: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createInstitutionManually = async (req, res) => {
  try {
    const { instituteName, website, city, state, district, country } = req.body;

    if (!instituteName || !state) {
      return res.status(400).json({
        success: false,
        message: "Institution name and state are required",
      });
    }

    const existing = await Institute.findOne({
      instituteName: { $regex: new RegExp(`^${instituteName}$`, "i") },
      "address.state": state,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        message: "Institution already exists in our database",
        alreadyExists: true,
      });
    }

    const newInstitution = await Institute.create({
      email: `${instituteName.toLowerCase().replace(/\s+/g, ".")}@temp.edu`,
      password: Math.random().toString(36).slice(-12),
      instituteName,
      website,
      address: {
        city,
        state,
        district,
        country: country || "India",
      },
      source: "learner_created",
      approvalStatus: "pending",
      createdBy: req.user.userId,
      emailVerified: false,
    });

    res.status(201).json({
      success: true,
      data: newInstitution,
      message: "Institution created successfully. Pending admin verification.",
      alreadyExists: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================================================
// PATHWAY MANAGEMENT
// ==============================================================================

export const getAllPathways = async (req, res) => {
  try {
    const learner = await Learner.findById(req.user.userId).select(
      "instituteId",
    );
    const pathwayQuery = {
      isActive: true,
      $or: [{ isGlobal: true }],
    };

    if (learner?.instituteId) {
      pathwayQuery.$or.push({ instituteId: learner.instituteId });
    }

    const pathways = await Pathway.find(pathwayQuery)
      .populate("instituteId", "_id instituteName instituteCode")
      .sort("name");

    const enrollments = await Enrollment.find({
      learnerId: req.user.userId,
      status: "active",
    }).select("pathwayId");

    const enrolledPathwayIds = new Set(
      enrollments.map((item) => item.pathwayId.toString()),
    );

    const withEnrollmentFlags = pathways.map((pathway) => ({
      ...pathway.toObject(),
      isEnrolled: enrolledPathwayIds.has(pathway._id.toString()),
    }));

    res.status(200).json({
      success: true,
      data: withEnrollmentFlags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPathwayDetails = async (req, res) => {
  try {
    const pathway = await Pathway.findById(req.params.id);

    if (!pathway) {
      return res.status(404).json({
        success: false,
        message: "Pathway not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pathway,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const enrollPathway = async (req, res) => {
  try {
    const { pathwayId } = req.body;

    const pathway = await Pathway.findById(pathwayId);

    if (!pathway) {
      return res.status(404).json({
        success: false,
        message: "Pathway not found",
      });
    }

    if (!pathway.isActive) {
      return res.status(400).json({
        success: false,
        message: "This pathway is not active",
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      learnerId: req.user.userId,
      pathwayId,
    });

    if (existingEnrollment && existingEnrollment.status === "active") {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this pathway",
      });
    }

    const learner = await Learner.findById(req.user.userId).select(
      "instituteId",
    );

    if (pathway.instituteId) {
      if (!learner?.instituteId) {
        return res.status(400).json({
          success: false,
          message: "Join an institute first to enroll in institute pathways",
        });
      }

      if (learner.instituteId.toString() !== pathway.instituteId.toString()) {
        return res.status(403).json({
          success: false,
          message: "This pathway belongs to a different institute",
        });
      }
    }

    let enrollment;
    if (existingEnrollment) {
      existingEnrollment.status = "active";
      existingEnrollment.instituteId =
        pathway.instituteId || learner?.instituteId || null;
      enrollment = await existingEnrollment.save();
    } else {
      enrollment = await Enrollment.create({
        learnerId: req.user.userId,
        pathwayId,
        instituteId: pathway.instituteId || learner?.instituteId || null,
      });
    }

    let profile = await LearnerProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      profile = await LearnerProfile.create({
        userId: req.user.userId,
        enrolledPathway: pathwayId,
      });
    } else if (!profile.enrolledPathway) {
      profile.enrolledPathway = pathwayId;
      await profile.save();
    }

    pathway.enrolledCount += 1;
    await pathway.save();

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in pathway",
      data: enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate enrollment is not allowed",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = { learnerId: req.user.userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [total, enrollments] = await Promise.all([
      Enrollment.countDocuments(filter),
      Enrollment.find(filter)
        .populate(
          "pathwayId",
          "name description category isActive instituteId isGlobal",
        )
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        results: enrollments,
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

export const getMyPathway = async (req, res) => {
  try {
    const activeEnrollment = await Enrollment.findOne({
      learnerId: req.user.userId,
      status: "active",
    })
      .populate("pathwayId")
      .sort("createdAt");

    const profile = await LearnerProfile.findOne({ userId: req.user.userId });

    if (!activeEnrollment || !activeEnrollment.pathwayId) {
      return res.status(404).json({
        success: false,
        message: "No pathway enrolled",
      });
    }

    const pathway = activeEnrollment.pathwayId;
    const verifiedCredits = profile?.verifiedCredits || 0;

    const levelsWithProgress = pathway.levels.map((level) => {
      const isCompleted = verifiedCredits >= level.requiredCredits;
      const isCurrent = level.level === profile.currentLevel;

      return {
        ...level.toObject(),
        isCompleted,
        isCurrent,
        progress: isCompleted
          ? 100
          : isCurrent
            ? Math.min((verifiedCredits / level.requiredCredits) * 100, 100)
            : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        pathway: {
          ...pathway.toObject(),
          levels: levelsWithProgress,
        },
        currentLevel: profile.currentLevel,
        verifiedCredits: profile.verifiedCredits,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unenrollPathway = async (req, res) => {
  try {
    const pathwayId = req.body.pathwayId;

    if (!pathwayId) {
      return res.status(400).json({
        success: false,
        message: "pathwayId is required",
      });
    }

    const enrollment = await Enrollment.findOne({
      learnerId: req.user.userId,
      pathwayId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "You are not enrolled in this pathway",
      });
    }

    enrollment.status = "dropped";
    await enrollment.save();

    const profile = await LearnerProfile.findOne({ userId: req.user.userId });

    if (profile?.enrolledPathway?.toString() === pathwayId.toString()) {
      const nextEnrollment = await Enrollment.findOne({
        learnerId: req.user.userId,
        status: "active",
        pathwayId: { $ne: pathwayId },
      })
        .sort("createdAt")
        .select("pathwayId");

      profile.enrolledPathway = nextEnrollment?.pathwayId || null;
      if (!profile.enrolledPathway) {
        profile.currentLevel = 1;
      }
      await profile.save();
    }

    await Pathway.findByIdAndUpdate(pathwayId, {
      $inc: { enrolledCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Successfully unenrolled from pathway",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================================================
// CREDENTIAL MANAGEMENT
// ==============================================================================

export const uploadCredential = async (req, res) => {
  try {
    const {
      title,
      description,
      nsqLevel,
      credits,
      pathwayId,
      institutionId,
      institutionName,
      certificateUrl,
      certificateNumber,
      issueDate,
      skills,
    } = req.body;

    if (!pathwayId) {
      return res.status(400).json({
        success: false,
        message: "pathwayId is required",
      });
    }

    const pathway = await Pathway.findById(pathwayId);
    if (!pathway || !pathway.isActive) {
      return res.status(400).json({
        success: false,
        message: "Pathway not found or inactive",
      });
    }

    const enrollment = await Enrollment.findOne({
      learnerId: req.user.userId,
      pathwayId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "You must enroll in this pathway before uploading credentials",
      });
    }

    let institution;

    if (pathway.instituteId) {
      institution = await Institute.findOne({
        _id: pathway.instituteId,
        isActive: true,
      });

      const learner = await Learner.findById(req.user.userId).select(
        "instituteId",
      );
      if (
        !learner?.instituteId ||
        learner.instituteId.toString() !== pathway.instituteId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Institute mismatch for selected pathway",
        });
      }
    } else if (institutionId) {
      institution = await Institute.findById(institutionId);
    } else if (institutionName) {
      institution = await Institute.findOne({
        instituteName: { $regex: new RegExp(`^${institutionName}$`, "i") },
        approvalStatus: "approved",
      });

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: `Institution "${institutionName}" not found. Please ensure the institution is registered and approved, or contact your administrator.`,
          hint: "Try selecting from the available institutions list",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "institutionId is required for global pathways",
      });
    }

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found or not approved",
      });
    }

    const finalInstitutionId = institution._id;

    const duplicateFilter = {
      learnerId: req.user.userId,
      pathwayId,
    };
    if (certificateNumber) {
      duplicateFilter.certificateNumber = certificateNumber;
    } else {
      duplicateFilter.title = title;
    }

    const existingCredential = await Credential.findOne(duplicateFilter);

    if (
      existingCredential &&
      ["approved", "verified"].includes(existingCredential.verificationStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Credential already approved and cannot be re-uploaded",
      });
    }

    if (existingCredential) {
      existingCredential.title = title;
      existingCredential.description = description;
      existingCredential.nsqLevel = nsqLevel;
      existingCredential.credits = credits;
      existingCredential.pathwayId = pathwayId;
      existingCredential.institutionId = finalInstitutionId;
      existingCredential.certificateUrl = certificateUrl;
      existingCredential.certificateNumber = certificateNumber;
      existingCredential.issueDate = issueDate || Date.now();
      existingCredential.skills = skills;
      existingCredential.verificationStatus = "pending";
      existingCredential.status = "pending";
      existingCredential.verifiedBy = null;
      existingCredential.verifiedAt = null;
      existingCredential.verificationDate = null;
      existingCredential.rejectedBy = null;
      existingCredential.rejectedAt = null;
      existingCredential.rejectionReason = null;
      existingCredential.remarks = null;

      await existingCredential.save();

      return res.status(200).json({
        success: true,
        message: "Credential re-uploaded successfully. Pending verification.",
        data: existingCredential,
      });
    }

    const credential = await Credential.create({
      learnerId: req.user.userId,
      pathwayId,
      institutionId: finalInstitutionId,
      title,
      description,
      nsqLevel,
      credits,
      certificateUrl,
      certificateNumber,
      issueDate: issueDate || Date.now(),
      skills,
      claimStatus: "claimed",
      status: "pending",
      verificationStatus: "pending",
    });

    await LearnerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { totalCredits: credits } },
      { upsert: true },
    );

    // Send notification to institute
    try {
      await notifyCredentialUploaded(req.io, {
        institutionId: finalInstitutionId,
        learnerId: req.user.userId,
        title,
        credentialId: credential._id,
      });
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Credential uploaded successfully. Pending verification.",
      data: credential,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate credential detected",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCredentials = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { learnerId: req.user.userId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.pathwayId) {
      filter.pathwayId = req.query.pathwayId;
    }

    const [total, results] = await Promise.all([
      Credential.countDocuments(filter),
      Credential.find(filter)
        .populate("institutionId", "instituteName instituteCode")
        .populate("pathwayId", "name category")
        .sort(req.query.sort || "-createdAt")
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
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

export const getCredentialById = async (req, res) => {
  try {
    const credential = await Credential.findOne({
      _id: req.params.id,
      learnerId: req.user.userId,
    })
      .populate("institutionId", "instituteName email website instituteCode")
      .populate("pathwayId", "name category");

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    res.status(200).json({
      success: true,
      data: credential,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCredential = async (req, res) => {
  try {
    const credential = await Credential.findOne({
      _id: req.params.id,
      learnerId: req.user.userId,
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    if (["approved", "verified"].includes(credential.verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete verified credentials",
      });
    }

    const profile = await LearnerProfile.findOne({ userId: req.user.userId });

    if (profile) {
      profile.totalCredits = Math.max(
        0,
        profile.totalCredits - credential.credits,
      );
      await profile.save();
    }

    await credential.deleteOne();

    res.status(200).json({
      success: true,
      message: "Credential deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const claimCredentials = async (req, res) => {
  try {
    const { email } = req.body;

    const unclaimedCredentials = await Credential.find({
      claimStatus: "unclaimed",
    });

    if (unclaimedCredentials.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No unclaimed credentials found for this email",
      });
    }

    const updatePromises = unclaimedCredentials.map(async (credential) => {
      credential.learnerId = req.user.userId;
      credential.claimStatus = "claimed";
      return credential.save();
    });

    await Promise.all(updatePromises);

    const totalCredits = unclaimedCredentials.reduce(
      (sum, cred) => sum + cred.credits,
      0,
    );
    const verifiedCredits = unclaimedCredentials
      .filter((cred) =>
        ["approved", "verified"].includes(cred.verificationStatus),
      )
      .reduce((sum, cred) => sum + cred.credits, 0);

    await LearnerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $inc: {
          totalCredits,
          verifiedCredits,
        },
      },
      { upsert: true },
    );

    await updateLearnerLevel(req.user.userId);

    res.status(200).json({
      success: true,
      message: `Successfully claimed ${unclaimedCredentials.length} credentials`,
      data: {
        claimedCount: unclaimedCredentials.length,
        totalCredits,
        verifiedCredits,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
