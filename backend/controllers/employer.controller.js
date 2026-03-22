import Employer from '../models/Employer.model.js';
import User from '../models/User.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Credential from '../models/Credential.model.js';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';
import Bookmark from '../models/Bookmark.model.js';
import logger from '../utils/logger.js';

// ==================== EMPLOYER PROFILE ====================

export const getProfile = async (req, res, next) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.userId })
      .populate('userId', 'name email isActive');

    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    res.json({ employer });
  } catch (error) {
    logger.error('Error fetching employer profile:', error);
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { companyName, website, description, location, industry, companySize, mobile } = req.body;

    const employer = await Employer.findOne({ userId: req.user.userId });

    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    // Update fields
    if (companyName) employer.companyName = companyName;
    if (website) employer.website = website;
    if (description) employer.description = description;
    if (location) employer.location = location;
    if (industry) employer.industry = industry;
    if (companySize) employer.companySize = companySize;
    if (mobile !== undefined) employer.mobile = mobile;

    await employer.save();

    logger.info(`Employer profile updated: ${employer._id}`);
    res.json({ 
      message: 'Profile updated successfully', 
      employer 
    });
  } catch (error) {
    logger.error('Error updating employer profile:', error);
    next(error);
  }
};

// ==================== SEARCH LEARNERS ====================

export const searchLearners = async (req, res, next) => {
  try {
    const { 
      skills, 
      nsqfLevel, 
      location, 
      minCredits,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter for learner profiles
    const profileFilter = {};
    
    if (nsqfLevel) {
      profileFilter.nsqfLevel = parseInt(nsqfLevel);
    }
    
    if (minCredits) {
      profileFilter.totalCredits = { $gte: parseInt(minCredits) };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      profileFilter.skills = { $in: skillsArray };
    }

    // Find matching learner profiles
    let profiles = await LearnerProfile.find(profileFilter)
      .populate({
        path: 'userId',
        match: { role: 'Learner', isActive: true },
        select: 'name email createdAt',
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out profiles where userId is null (user not found or not active)
    profiles = profiles.filter(p => p.userId);

    // Get credentials for each learner
    const learnersWithDetails = await Promise.all(
      profiles.map(async (profile) => {
        const credentials = await Credential.find({
          userId: profile.userId._id,
          verificationStatus: 'verified',
        })
          .select('title skills credits nsqfLevel issueDate issuerId')
          .populate('issuerId', 'name')
          .limit(5)
          .lean();

        return {
          _id: profile.userId._id,
          name: profile.userId.name,
          email: profile.userId.email,
          bio: profile.bio,
          skills: profile.skills,
          nsqfLevel: profile.nsqfLevel,
          totalCredits: profile.totalCredits,
          credentials: credentials,
          verifiedCredentials: credentials.length,
          joinedAt: profile.userId.createdAt,
        };
      })
    );

    // Apply text search filter if provided
    let filteredLearners = learnersWithDetails;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLearners = learnersWithDetails.filter(learner =>
        learner.name.toLowerCase().includes(searchLower) ||
        learner.bio?.toLowerCase().includes(searchLower) ||
        learner.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    // Apply location filter if provided
    if (location) {
      // This would require location data in learner profiles
      // For now, we'll skip this filter
    }

    const total = await LearnerProfile.countDocuments(profileFilter);

    res.json({
      learners: filteredLearners,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error searching learners:', error);
    next(error);
  }
};

// ==================== VIEW LEARNER DETAILS ====================

export const getLearnerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get user
    const user = await User.findById(id).select('name email createdAt role isActive');
    
    if (!user || user.role !== 'Learner') {
      return res.status(404).json({ error: 'Learner not found' });
    }

    // Get profile
    const profile = await LearnerProfile.findOne({ userId: id });

    if (!profile) {
      return res.status(404).json({ error: 'Learner profile not found' });
    }

    // Get all verified credentials
    const credentials = await Credential.find({
      userId: id,
      verificationStatus: 'verified',
    })
      .populate('issuerId', 'name contactEmail')
      .sort({ issueDate: -1 });

    // Check if bookmarked by this employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    const isBookmarked = await Bookmark.exists({
      employerId: employer._id,
      learnerId: id,
    });

    res.json({
      learner: {
        _id: user._id,
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt,
        bio: profile.bio,
        skills: profile.skills,
        nsqfLevel: profile.nsqfLevel,
        totalCredits: profile.totalCredits,
        education: profile.education,
        experience: profile.experience,
      },
      credentials,
      isBookmarked: !!isBookmarked,
      stats: {
        totalCredentials: credentials.length,
        totalCredits: profile.totalCredits,
        nsqfLevel: profile.nsqfLevel,
      },
    });
  } catch (error) {
    logger.error('Error fetching learner details:', error);
    next(error);
  }
};

// ==================== BOOKMARK SYSTEM ====================

export const addBookmark = async (req, res, next) => {
  try {
    const { learnerId } = req.params;
    const { notes, tags, folder } = req.body;

    // Verify learner exists
    const learner = await User.findById(learnerId);
    if (!learner || learner.role !== 'Learner') {
      return res.status(404).json({ error: 'Learner not found' });
    }

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      employerId: employer._id,
      learnerId,
    });

    if (existing) {
      return res.status(409).json({ error: 'Learner already bookmarked' });
    }

    // Create bookmark
    const bookmark = new Bookmark({
      employerId: employer._id,
      learnerId,
      notes: notes || '',
      tags: tags || [],
      folder: folder || 'default',
    });

    await bookmark.save();

    logger.info(`Bookmark created: ${bookmark._id}`);
    res.status(201).json({ 
      message: 'Learner bookmarked successfully', 
      bookmark 
    });
  } catch (error) {
    logger.error('Error adding bookmark:', error);
    next(error);
  }
};

export const getBookmarks = async (req, res, next) => {
  try {
    const { folder, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const filter = { employerId: employer._id };
    if (folder) {
      filter.folder = folder;
    }

    const [bookmarks, total] = await Promise.all([
      Bookmark.find(filter)
        .populate({
          path: 'learnerId',
          select: 'name email',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Bookmark.countDocuments(filter),
    ]);

    // Get learner profiles and credentials for each bookmark
    const bookmarksWithDetails = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const profile = await LearnerProfile.findOne({ userId: bookmark.learnerId._id })
          .select('skills nsqfLevel totalCredits bio');

        const credentialCount = await Credential.countDocuments({
          userId: bookmark.learnerId._id,
          verificationStatus: 'verified',
        });

        return {
          ...bookmark,
          learnerProfile: profile,
          credentialCount,
        };
      })
    );

    res.json({
      bookmarks: bookmarksWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching bookmarks:', error);
    next(error);
  }
};

export const removeBookmark = async (req, res, next) => {
  try {
    const { learnerId } = req.params;

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const bookmark = await Bookmark.findOneAndDelete({
      employerId: employer._id,
      learnerId,
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    logger.info(`Bookmark removed: ${bookmark._id}`);
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    logger.error('Error removing bookmark:', error);
    next(error);
  }
};

// ==================== JOB MANAGEMENT ====================

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      nsqfLevel,
      location,
      locationType,
      salaryRange,
      employmentType,
      experience,
      applicationDeadline,
      status,
    } = req.body;

    // Validate required fields
    if (!title || !description || !location) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'location'],
      });
    }

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    // Create job
    const job = new Job({
      employerId: employer._id,
      title,
      description,
      requiredSkills: requiredSkills || [],
      nsqfLevel,
      location,
      locationType: locationType || 'onsite',
      salaryRange,
      employmentType: employmentType || 'full-time',
      experience,
      applicationDeadline,
      status: status || 'draft',
    });

    await job.save();

    logger.info(`Job created: ${job._id}`);
    res.status(201).json({ 
      message: 'Job created successfully', 
      job 
    });
  } catch (error) {
    logger.error('Error creating job:', error);
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const filter = { employerId: employer._id };
    if (status) {
      filter.status = status;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(filter),
    ]);

    // Get application counts for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationStats = await Application.aggregate([
          { $match: { jobId: job._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]);

        const stats = {
          total: 0,
          applied: 0,
          shortlisted: 0,
          interviewing: 0,
          hired: 0,
        };

        applicationStats.forEach(stat => {
          stats.total += stat.count;
          if (stat._id in stats) {
            stats[stat._id] = stat.count;
          }
        });

        return {
          ...job,
          applicationStats: stats,
        };
      })
    );

    res.json({
      jobs: jobsWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const job = await Job.findOne({
      _id: id,
      employerId: employer._id,
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get application statistics
    const applicationStats = await Application.aggregate([
      { $match: { jobId: job._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      applied: 0,
      shortlisted: 0,
      interviewing: 0,
      rejected: 0,
      hired: 0,
    };

    applicationStats.forEach(stat => {
      stats.total += stat.count;
      if (stat._id in stats) {
        stats[stat._id] = stat.count;
      }
    });

    res.json({
      job,
      applicationStats: stats,
    });
  } catch (error) {
    logger.error('Error fetching job:', error);
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const job = await Job.findOne({
      _id: id,
      employerId: employer._id,
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'description',
      'requiredSkills',
      'nsqfLevel',
      'location',
      'locationType',
      'salaryRange',
      'employmentType',
      'experience',
      'applicationDeadline',
      'status',
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        job[field] = updates[field];
      }
    });

    await job.save();

    logger.info(`Job updated: ${job._id}`);
    res.json({ 
      message: 'Job updated successfully', 
      job 
    });
  } catch (error) {
    logger.error('Error updating job:', error);
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const job = await Job.findOne({
      _id: id,
      employerId: employer._id,
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if there are applications
    const applicationCount = await Application.countDocuments({ jobId: id });
    
    if (applicationCount > 0) {
      // Don't delete, just close the job
      job.status = 'closed';
      await job.save();
      
      return res.json({ 
        message: 'Job closed successfully (has applications)', 
        job 
      });
    }

    // Delete job if no applications
    await Job.deleteOne({ _id: id });

    logger.info(`Job deleted: ${id}`);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    logger.error('Error deleting job:', error);
    next(error);
  }
};

// ==================== JOB APPLICATIONS ====================

export const getJobApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    // Verify job belongs to employer
    const job = await Job.findOne({
      _id: id,
      employerId: employer._id,
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const filter = { jobId: id };
    if (status) {
      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('learnerId', 'name email')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(filter),
    ]);

    // Get learner profiles and credentials for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (application) => {
        const profile = await LearnerProfile.findOne({ userId: application.learnerId._id })
          .select('skills nsqfLevel totalCredits bio');

        const credentials = await Credential.find({
          userId: application.learnerId._id,
          verificationStatus: 'verified',
        })
          .select('title skills credits nsqfLevel')
          .limit(5);

        return {
          ...application,
          learnerProfile: profile,
          credentials,
        };
      })
    );

    res.json({
      applications: applicationsWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching job applications:', error);
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['applied', 'shortlisted', 'interviewing', 'rejected', 'hired', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    // Find application and verify it belongs to employer's job
    const application = await Application.findById(id).populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update status
    application.status = status;
    if (notes) {
      application.employerNotes = notes;
    }

    // Add to status history
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.userId,
      notes,
    });

    await application.save();

    logger.info(`Application status updated: ${application._id} -> ${status}`);
    res.json({ 
      message: 'Application status updated successfully', 
      application 
    });
  } catch (error) {
    logger.error('Error updating application status:', error);
    next(error);
  }
};

// ==================== CREDENTIAL VERIFICATION ====================

export const verifyCredential = async (req, res, next) => {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findById(credentialId)
      .populate('userId', 'name email')
      .populate('issuerId', 'name contactEmail');

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Return detailed verification information
    res.json({
      credential: {
        _id: credential._id,
        title: credential.title,
        description: credential.description,
        skills: credential.skills,
        credits: credential.credits,
        nsqfLevel: credential.nsqfLevel,
        issueDate: credential.issueDate,
        expiryDate: credential.expiryDate,
        verificationStatus: credential.verificationStatus,
        credentialUrl: credential.credentialUrl,
        credentialHash: credential.credentialHash,
      },
      learner: {
        name: credential.userId.name,
        email: credential.userId.email,
      },
      issuer: {
        name: credential.issuerId.name,
        contactEmail: credential.issuerId.contactEmail,
      },
      verification: {
        isVerified: credential.verificationStatus === 'verified',
        verifiedAt: credential.verifiedAt,
        status: credential.verificationStatus,
      },
    });
  } catch (error) {
    logger.error('Error verifying credential:', error);
    next(error);
  }
};

// ==================== DASHBOARD STATS ====================

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get employer
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      newApplications,
      bookmarkCount,
    ] = await Promise.all([
      Job.countDocuments({ employerId: employer._id }),
      Job.countDocuments({ employerId: employer._id, status: 'open' }),
      Application.countDocuments({ employerId: employer._id }),
      Application.countDocuments({
        employerId: employer._id,
        status: 'applied',
        appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Bookmark.countDocuments({ employerId: employer._id }),
    ]);

    // Get application status breakdown
    const applicationsByStatus = await Application.aggregate([
      { $match: { employerId: employer._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        newApplications,
        bookmarkCount,
      },
      applicationsByStatus,
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    next(error);
  }
};
