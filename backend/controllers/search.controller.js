import User from '../models/User.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Credential from '../models/Credential.model.js';
import Job from '../models/Job.model.js';
import Employer from '../models/Employer.model.js';
import Issuer from '../models/Issuer.model.js';
import BlogPost from '../models/BlogPost.model.js';
import Application from '../models/Application.model.js';

// ==================== LEARNER SEARCH ====================
export const learnerSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const results = [];

    if (!q || !q.trim()) {
      return res.json({ results: [] });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');

    // Search credentials
    const credentials = await Credential.find({
      userId: req.user.userId,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { skills: { $in: [searchRegex] } }
      ]
    })
    .populate('issuerId', 'name')
    .limit(parseInt(limit) / 2)
    .lean();

    credentials.forEach(cred => {
      results.push({
        id: cred._id,
        type: 'credential',
        title: cred.title,
        subtitle: cred.issuerId?.name || 'Credential',
        href: '/credentials'
      });
    });

    // Search jobs (from recommendations)
    const jobs = await Job.find({
      status: 'open',
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: { $in: [searchRegex] } }
      ]
    })
    .populate('employerId', 'companyName')
    .limit(parseInt(limit) / 2)
    .lean();

    jobs.forEach(job => {
      results.push({
        id: job._id,
        type: 'job',
        title: job.title,
        subtitle: job.employerId?.companyName || 'Job',
        href: '/jobs/recommended'
      });
    });

    res.json({ results: results.slice(0, parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// ==================== EMPLOYER SEARCH ====================
export const employerSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const results = [];

    if (!q || !q.trim()) {
      return res.json({ results: [] });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');

    // Search learners
    const learnerProfiles = await LearnerProfile.find({
      $or: [
        { skills: { $in: [searchRegex] } },
        { bio: searchRegex }
      ]
    })
    .populate({
      path: 'userId',
      match: { 
        role: 'Learner', 
        isActive: true,
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      },
      select: 'name email'
    })
    .limit(parseInt(limit) / 2)
    .lean();

    learnerProfiles
      .filter(profile => profile.userId)
      .forEach(profile => {
        results.push({
          id: profile._id,
          type: 'learner',
          title: profile.userId.name,
          subtitle: `NSQF Level ${profile.nsqfLevel} • ${profile.skills?.slice(0, 2).join(', ') || 'Skills'}`,
          href: `/employer/learners/${profile.userId._id}`
        });
      });

    // Search employer's jobs
    const employer = await Employer.findOne({ userId: req.user.userId });
    if (employer) {
      const jobs = await Job.find({
        employerId: employer._id,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { requiredSkills: { $in: [searchRegex] } }
        ]
      })
      .limit(parseInt(limit) / 2)
      .lean();

      // Get application counts for jobs
      const jobsWithStats = await Promise.all(
        jobs.map(async (job) => {
          const applicationCount = await Application.countDocuments({ jobId: job._id });
          return {
            ...job,
            applicationCount
          };
        })
      );

      jobsWithStats.forEach(job => {
        results.push({
          id: job._id,
          type: 'job',
          title: job.title,
          subtitle: `${job.applicationCount || 0} applications`,
          href: `/employer/jobs/${job._id}`
        });
      });
    }

    res.json({ results: results.slice(0, parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// ==================== ISSUER SEARCH ====================
export const issuerSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const results = [];

    if (!q || !q.trim()) {
      return res.json({ results: [] });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');

    // Search learners with credentials from this issuer
    const issuer = await Issuer.findOne({ contactEmail: req.user.email });
    if (issuer) {
      // Find credentials issued by this issuer
      const credentials = await Credential.find({
        issuerId: issuer._id,
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate({
        path: 'userId',
        match: { 
          role: 'Learner', 
          isActive: true,
          $or: [
            { name: searchRegex },
            { email: searchRegex }
          ]
        },
        select: 'name email'
      })
      .limit(parseInt(limit))
      .lean();

      // Also search learners by name/email directly
      const learnerProfiles = await LearnerProfile.find({})
      .populate({
        path: 'userId',
        match: { 
          role: 'Learner', 
          isActive: true,
          $or: [
            { name: searchRegex },
            { email: searchRegex }
          ]
        },
        select: 'name email'
      })
      .limit(parseInt(limit))
      .lean();

      // Combine and deduplicate learners
      const learnerMap = new Map();
      
      credentials
        .filter(cred => cred.userId)
        .forEach(cred => {
          learnerMap.set(cred.userId._id.toString(), {
            id: cred.userId._id,
            type: 'learner',
            title: cred.userId.name,
            subtitle: `Has credential: ${cred.title}`,
            href: `/issuer/learners/${cred.userId._id}`
          });
        });

      learnerProfiles
        .filter(profile => profile.userId)
        .forEach(profile => {
          if (!learnerMap.has(profile.userId._id.toString())) {
            learnerMap.set(profile.userId._id.toString(), {
              id: profile.userId._id,
              type: 'learner',
              title: profile.userId.name,
              subtitle: `${profile.totalCredits || 0} credits • NSQF Level ${profile.nsqfLevel || 0}`,
              href: `/issuer/learners/${profile.userId._id}`
            });
          }
        });

      results.push(...Array.from(learnerMap.values()));
    }

    res.json({ results: results.slice(0, parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN SEARCH ====================
export const adminSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const results = [];

    if (!q || !q.trim()) {
      return res.json({ results: [] });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');

    // Search users
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ],
      isActive: true
    })
    .limit(Math.ceil(parseInt(limit) / 3))
    .lean();

    users.forEach(user => {
      results.push({
        id: user._id,
        type: 'user',
        title: user.name,
        subtitle: `${user.role} • ${user.email}`,
        href: `/admin/users/${user._id}`
      });
    });

    // Search issuers
    const issuers = await Issuer.find({
      $or: [
        { name: searchRegex },
        { contactEmail: searchRegex }
      ]
    })
    .limit(Math.ceil(parseInt(limit) / 3))
    .lean();

    issuers.forEach(issuer => {
      results.push({
        id: issuer._id,
        type: 'issuer',
        title: issuer.name,
        subtitle: `${issuer.status} • ${issuer.contactEmail}`,
        href: '/admin/issuers'
      });
    });

    // Search employers
    const employers = await Employer.find({
      $or: [
        { companyName: searchRegex },
        { contactEmail: searchRegex }
      ]
    })
    .limit(Math.ceil(parseInt(limit) / 3))
    .lean();

    employers.forEach(employer => {
      results.push({
        id: employer._id,
        type: 'employer',
        title: employer.companyName,
        subtitle: `${employer.verified ? 'Verified' : 'Unverified'} • ${employer.contactEmail}`,
        href: '/admin/employers'
      });
    });

    res.json({ results: results.slice(0, parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

export default {
  learnerSearch,
  employerSearch,
  issuerSearch,
  adminSearch,
};