import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Employer from '../models/Employer.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';
import { validateObjectId } from '../utils/validation.util.js';

// GET /users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').limit(100);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /users/:id
export const getUserById = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'User ID');
    
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && req.user.userId.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id
export const updateUser = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'User ID');
    
    const { name, password, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    const isSelf = req.user.userId.toString() === req.params.id;
    const isAdmin = req.user.role === 'Admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (name) user.name = name;
    if (password) user.passwordHash = password;
    if (role && isAdmin) user.role = role;

    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'User ID');
    
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// PUT /users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /users/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/jobs (Learner)
export const getOpenJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      locationType,
      employmentType,
      nsqfLevel,
      skills,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
      status: 'open',
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: null },
        { applicationDeadline: { $gte: new Date() } },
      ],
    };

    if (search) {
      filter.$text = { $search: search };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (locationType) {
      filter.locationType = locationType;
    }
    if (employmentType) {
      filter.employmentType = employmentType;
    }
    if (nsqfLevel) {
      filter.nsqfLevel = { $lte: parseInt(nsqfLevel, 10) || 1 };
    }
    if (skills) {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillsArray.length > 0) {
        filter.requiredSkills = { $in: skillsArray };
      }
    }

    const [jobs, total, learnerProfile] = await Promise.all([
      Job.find(filter)
        .populate('employerId', 'companyName industry location website')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Job.countDocuments(filter),
      LearnerProfile.findOne({ userId: req.user.userId }).select('skills nsqfLevel').lean(),
    ]);

    const jobIds = jobs.map((job) => job._id);
    const existingApplications = await Application.find({
      jobId: { $in: jobIds },
      learnerId: req.user.userId,
    })
      .select('jobId status')
      .lean();

    const appliedMap = new Map(existingApplications.map((app) => [app.jobId.toString(), app.status]));
    const learnerSkills = learnerProfile?.skills || [];

    const jobsWithTracking = jobs.map((job) => {
      const matchedSkills = (job.requiredSkills || []).filter((skill) => learnerSkills.includes(skill));
      const matchScore = job.requiredSkills?.length
        ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100)
        : 0;

      return {
        ...job,
        hasApplied: appliedMap.has(job._id.toString()),
        applicationStatus: appliedMap.get(job._id.toString()) || null,
        matchScore,
      };
    });

    res.json({
      jobs: jobsWithTracking,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /users/jobs/:jobId/apply (Learner)
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resume } = req.body;

    validateObjectId(jobId, 'Job ID');

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job is not open for applications' });
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({ error: 'Application deadline has passed' });
    }

    const employerExists = await Employer.findById(job.employerId).select('_id').lean();
    if (!employerExists) {
      return res.status(404).json({ error: 'Employer not found for this job' });
    }

    const existingApplication = await Application.findOne({
      jobId,
      learnerId: req.user.userId,
    }).lean();

    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    const application = new Application({
      jobId,
      learnerId: req.user.userId,
      employerId: job.employerId,
      status: 'applied',
      coverLetter,
      resume,
      statusHistory: [
        {
          status: 'applied',
          changedAt: new Date(),
          changedBy: req.user.userId,
          notes: 'Application submitted by learner',
        },
      ],
    });

    await application.save();

    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/applications (Learner)
export const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    // Convert userId to ObjectId for proper matching
    const learnerObjectId = new mongoose.Types.ObjectId(req.user.userId);
    
    console.log('User ID:', req.user.userId);
    console.log('Learner ObjectId:', learnerObjectId);
    console.log('Search term:', search);
    
    const filter = { learnerId: learnerObjectId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    console.log('Filter:', filter);

    // Build aggregation pipeline for search
    let pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'employers',
          localField: 'job.employerId',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' }
    ];

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'job.title': searchRegex },
            { 'employer.companyName': searchRegex },
            { 'job.location': searchRegex },
            { 'job.description': searchRegex }
          ]
        }
      });
    }

    // Add sorting, skip, and limit
    pipeline.push(
      { $sort: { appliedAt: -1 } },
      { $skip: skip },
      { $limit: limitNumber }
    );

    // Execute aggregation for applications
    const applications = await Application.aggregate(pipeline);

    // Get total count for pagination (without skip/limit)
    let countPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'employers',
          localField: 'job.employerId',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' }
    ];

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      countPipeline.push({
        $match: {
          $or: [
            { 'job.title': searchRegex },
            { 'employer.companyName': searchRegex },
            { 'job.location': searchRegex },
            { 'job.description': searchRegex }
          ]
        }
      });
    }

    countPipeline.push({ $count: "total" });
    const countResult = await Application.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Get status summary (always for all applications, not filtered by search)
    const statusSummary = await Application.aggregate([
      { $match: { learnerId: learnerObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    console.log('Applications found:', applications.length);
    console.log('Total count:', total);
    console.log('Status summary:', statusSummary);

    // Transform applications to match expected format
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      coverLetter: app.coverLetter,
      resume: app.resume,
      statusHistory: app.statusHistory,
      employerNotes: app.employerNotes,
      rating: app.rating,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      jobId: {
        _id: app.job._id,
        title: app.job.title,
        location: app.job.location,
        locationType: app.job.locationType,
        description: app.job.description,
        employerId: {
          _id: app.employer._id,
          companyName: app.employer.companyName,
          industry: app.employer.industry,
          location: app.employer.location,
          website: app.employer.website
        }
      }
    }));

    const summary = {
      total: 0,
      applied: 0,
      shortlisted: 0,
      interviewing: 0,
      rejected: 0,
      hired: 0,
      withdrawn: 0,
    };

    statusSummary.forEach((item) => {
      summary.total += item.count;
      if (summary.hasOwnProperty(item._id)) {
        summary[item._id] = item.count;
      }
    });

    console.log('Final summary:', summary);

    res.json({
      applications: formattedApplications,
      summary,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error('Error in getMyApplications:', error);
    next(error);
  }
};

// PATCH /users/applications/:id/withdraw (Learner)
export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Application ID');

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.learnerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({ error: `Cannot withdraw an application with status: ${application.status}` });
    }

    application.status = 'withdrawn';
    application.statusHistory.push({
      status: 'withdrawn',
      changedAt: new Date(),
      changedBy: req.user.userId,
      notes: 'Withdrawn by learner',
    });

    await application.save();

    res.json({
      message: 'Application withdrawn successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

