import Credential from '../models/Credential.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';
import * as aiService from '../services/ai.service.js';
import * as skillService from '../services/skill.service.js';
import { sendNotification } from '../utils/notification.util.js';
import logger from '../utils/logger.js';

const normalizeSkill = (skill = '') => String(skill).trim().toLowerCase();

const buildSkillMap = (skills = []) => {
  return skills.reduce((map, skill) => {
    map[normalizeSkill(skill.name)] = Number(skill.level) || 0;
    return map;
  }, {});
};

const scoreJobRelevance = (job, userSkillMap, userNsqfLevel) => {
  const requiredSkills = Array.isArray(job.requiredSkills)
    ? [...new Set(job.requiredSkills.map(normalizeSkill).filter(Boolean))]
    : [];

  const matchedSkills = requiredSkills.filter((skill) => userSkillMap[skill] > 0);
  const missingSkills = requiredSkills.filter((skill) => !userSkillMap[skill]);

  const skillScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 50;

  let nsqfScore = 70;
  if (job.nsqfLevel && userNsqfLevel) {
    const gap = Math.abs(Number(job.nsqfLevel) - Number(userNsqfLevel));
    nsqfScore = Math.max(0, 100 - (gap * 20));
  }

  const matchScore = Math.round((skillScore * 0.75) + (nsqfScore * 0.25));

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    isRelevant: requiredSkills.length > 0
      ? matchedSkills.length > 0 && matchScore >= 55
      : matchScore >= 60,
  };
};

const getRelevantJobsForUser = async (userId, { minMatch = 55, page = 1, limit = 20, includeApplied = false } = {}) => {
  const [profile, skillAnalysis] = await Promise.all([
    LearnerProfile.findOne({ userId }).lean(),
    skillService.analyzeUserSkills(userId),
  ]);

  if (!profile) {
    return {
      profile: null,
      skillAnalysis,
      jobs: [],
      total: 0,
      page,
      pages: 0,
      limit,
    };
  }

  const userSkillMap = buildSkillMap(skillAnalysis.skills);

  const openJobsFilter = {
    status: 'open',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: null },
      { applicationDeadline: { $gte: new Date() } },
    ],
  };

  if (!includeApplied) {
    const appliedJobIds = await Application.find({ learnerId: userId }).distinct('jobId');
    if (appliedJobIds.length > 0) {
      openJobsFilter._id = { $nin: appliedJobIds };
    }
  }

  const jobs = await Job.find(openJobsFilter)
    .populate('employerId', 'companyName location industry')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const scoredJobs = jobs
    .map((job) => {
      const score = scoreJobRelevance(job, userSkillMap, profile.nsqfLevel);
      return {
        ...job,
        ...score,
        whyMatch: score.matchedSkills.length > 0
          ? `Matches ${score.matchedSkills.slice(0, 4).join(', ')}`
          : 'Low skill overlap',
      };
    })
    .filter((job) => job.isRelevant && job.matchScore >= minMatch)
    .sort((a, b) => b.matchScore - a.matchScore || new Date(b.createdAt) - new Date(a.createdAt));

  const total = scoredJobs.length;
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  return {
    profile,
    skillAnalysis,
    jobs: scoredJobs.slice(skip, skip + safeLimit),
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
    limit: safeLimit,
  };
};

// POST /recommendations/analyze
export const analyzeSkills = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user's credentials
    const credentials = await Credential.find({
      userId,
      verificationStatus: 'verified',
    }).populate('issuerId', 'name');

    // Get learner profile
    const profile = await LearnerProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Analyze skills
    const skillAnalysis = await skillService.analyzeUserSkills(userId);

    // Get trending skills
    const trendingSkills = await skillService.getTrendingSkills();

    res.json({
      totalCredentials: credentials.length,
      totalCredits: profile.totalCredits,
      nsqfLevel: profile.nsqfLevel,
      levelName: profile.levelName,
      skills: skillAnalysis.skills,
      totalSkills: skillAnalysis.totalSkills,
      averageSkillLevel: Math.round(skillAnalysis.averageLevel * 10) / 10,
      trendingSkills: trendingSkills.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

// POST /recommendations/skill-gap
export const calculateSkillGap = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { careerPath } = req.body;

    if (!careerPath) {
      return res.status(400).json({ error: 'Career path is required' });
    }

    // Get user's current skills
    const skillAnalysis = await skillService.analyzeUserSkills(userId);
    const userSkillMap = {};
    skillAnalysis.skills.forEach(skill => {
      userSkillMap[skill.name] = skill.level;
    });

    // Get target skills for career path
    const targetSkills = skillService.getCareerPathSkills(careerPath);

    if (targetSkills.length === 0) {
      return res.status(400).json({ error: 'Invalid career path' });
    }

    // Calculate skill gaps
    const skillGaps = skillService.calculateSkillGap(userSkillMap, targetSkills);

    // Calculate overall proficiency
    const totalProficiency = targetSkills.reduce((sum, target) => {
      const current = userSkillMap[target.name.toLowerCase()] || 0;
      return sum + skillService.calculateProficiency(current, target.level);
    }, 0);
    const averageProficiency = Math.round(totalProficiency / targetSkills.length);

    // Generate roadmap
    const roadmap = skillService.generateSkillRoadmap(
      skillAnalysis.skills,
      targetSkills
    );

    res.json({
      careerPath,
      currentSkills: skillAnalysis.skills,
      targetSkills,
      skillGaps,
      proficiency: averageProficiency,
      roadmap,
      gapsCount: skillGaps.length,
    });
  } catch (error) {
    next(error);
  }
};

// POST /recommendations/generate
export const generateRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { careerPath } = req.body;

    // Get user's profile and skills
    const profile = await LearnerProfile.findOne({ userId });
    const skillAnalysis = await skillService.analyzeUserSkills(userId);
    
    const userSkillMap = {};
    skillAnalysis.skills.forEach(skill => {
      userSkillMap[skill.name] = skill.level;
    });

    // Get target skills
    const targetSkills = careerPath 
      ? skillService.getCareerPathSkills(careerPath)
      : [];

    // Calculate skill gaps
    const skillGaps = targetSkills.length > 0
      ? skillService.calculateSkillGap(userSkillMap, targetSkills)
      : [];

    // Generate recommendations with fallback
    let courses = [];
    let projects = [];
    let careerRoles = [];
    let recommendedJobs = [];
    let recommendedCertifications = [];
    let portfolioSuggestions = [];
    let skillMapInsights = [];
    let recommendationSummary = '';
    let aiMetadata = null;
    let aiEnabled = false;

    const hasValidApiKey = aiService.isAIConfigured();

    if (hasValidApiKey) {
      try {
        logger.info('Attempting AI-powered recommendations...');

        const aiRecommendations = await aiService.generateUnifiedRecommendations({
          careerPath,
          userSkills: skillAnalysis.skills.slice(0, 8),
          skillGaps: skillGaps.slice(0, 6),
          nsqfLevel: profile?.nsqfLevel || 1,
          totalCredentials: profile?.totalCredentials || 0,
          totalCredits: profile?.totalCredits || 0,
        });

        courses = aiRecommendations.courses || [];
        projects = aiRecommendations.projects || [];
        careerRoles = aiRecommendations.careerRoles || [];
        recommendedJobs = aiRecommendations.recommendedJobs || [];
        recommendedCertifications = aiRecommendations.recommendedCertifications || [];
        portfolioSuggestions = aiRecommendations.portfolioSuggestions || [];
        skillMapInsights = aiRecommendations.skillMapInsights || [];
        recommendationSummary = aiRecommendations.summary || '';
        aiMetadata = aiRecommendations.aiMetadata || null;

        aiEnabled = Boolean(
          courses.length ||
          projects.length ||
          careerRoles.length ||
          recommendedJobs.length ||
          recommendedCertifications.length
        );

        logger.info(aiEnabled ? 'AI recommendations generated successfully' : 'AI returned empty output, using fallback');
      } catch (aiError) {
        logger.warn('AI recommendation generation failed, using fallback:', aiError.message);
      }
    } else {
      logger.info('Using fallback recommendations (AI provider not configured)');
    }

    // Enhanced fallback recommendations
    if (courses.length === 0) {
      courses = skillGaps.slice(0, 5).map((gap, index) => ({
        id: index + 1,
        title: `${gap.name} - From Beginner to Advanced`,
        platform: 'Coursera / Udemy / edX',
        targetSkill: gap.name,
        targetLevel: gap.required,
        description: `Master ${gap.name} with comprehensive online courses`,
        duration: gap.gap > 3 ? '3-6 months' : '1-3 months',
      }));

      // Add general courses if no gaps
      if (courses.length === 0 && careerPath) {
        courses = [
          {
            id: 1,
            title: `${careerPath} Bootcamp`,
            platform: 'Udemy',
            description: `Complete bootcamp for ${careerPath}`,
            duration: '3-6 months',
          },
          {
            id: 2,
            title: `Advanced ${careerPath} Techniques`,
            platform: 'Coursera',
            description: `Take your ${careerPath} skills to the next level`,
            duration: '2-4 months',
          },
          {
            id: 3,
            title: `${careerPath} Certification Prep`,
            platform: 'LinkedIn Learning',
            description: `Prepare for industry certifications`,
            duration: '1-2 months',
          },
        ];
      }
    }

    if (projects.length === 0) {
      projects = skillGaps.slice(0, 5).map((gap, index) => ({
        id: index + 1,
        title: `Build a ${gap.name} Application`,
        difficulty: gap.gap > 3 ? 'Advanced' : gap.gap > 1 ? 'Intermediate' : 'Beginner',
        skills: [gap.name],
        description: `Hands-on project to practice ${gap.name}`,
        estimatedTime: gap.gap > 3 ? '4-6 weeks' : '2-4 weeks',
      }));

      // Add general projects if no gaps
      if (projects.length === 0 && careerPath) {
        projects = [
          {
            id: 1,
            title: `Portfolio Website for ${careerPath}`,
            difficulty: 'Intermediate',
            skills: ['HTML', 'CSS', 'JavaScript'],
            description: 'Build a professional portfolio to showcase your work',
            estimatedTime: '2-3 weeks',
          },
          {
            id: 2,
            title: `${careerPath} Capstone Project`,
            difficulty: 'Advanced',
            skills: targetSkills.slice(0, 3).map(s => s.name),
            description: 'Complete end-to-end project demonstrating all skills',
            estimatedTime: '6-8 weeks',
          },
          {
            id: 3,
            title: 'Open Source Contribution',
            difficulty: 'Intermediate',
            skills: ['Git', 'Collaboration'],
            description: 'Contribute to real-world open source projects',
            estimatedTime: '4-6 weeks',
          },
        ];
      }
    }

    if (careerRoles.length === 0) {
      const rolesByPath = {
        'Full Stack Developer': [
          'Junior Full Stack Developer',
          'Senior Full Stack Developer',
          'Full Stack Team Lead',
        ],
        'Data Scientist': [
          'Junior Data Scientist',
          'Senior Data Scientist',
          'Lead Data Scientist',
        ],
        'DevOps Engineer': [
          'DevOps Engineer',
          'Senior DevOps Engineer',
          'DevOps Architect',
        ],
        'Mobile Developer': [
          'Mobile App Developer',
          'Senior Mobile Developer',
          'Mobile Architecture Lead',
        ],
        'Cloud Architect': [
          'Cloud Engineer',
          'Senior Cloud Architect',
          'Principal Cloud Architect',
        ],
      };

      careerRoles = rolesByPath[careerPath] || [
        careerPath || 'Software Developer',
        `Senior ${careerPath || 'Software Developer'}`,
        `Lead ${careerPath || 'Software Developer'}`,
      ];
    }

    const relevantJobs = await getRelevantJobsForUser(userId, {
      minMatch: 55,
      page: 1,
      limit: 6,
      includeApplied: false,
    });

    if (relevantJobs.jobs.length > 0) {
      recommendedJobs = relevantJobs.jobs.map((job) => ({
        id: job._id,
        title: job.title,
        matchScore: job.matchScore,
        salaryRange: job.salaryRange?.min && job.salaryRange?.max
          ? `${job.salaryRange.min} - ${job.salaryRange.max} ${job.salaryRange.currency || 'INR'}`
          : 'Negotiable',
        whyMatch: job.whyMatch,
        employer: job.employerId?.companyName,
        location: job.location,
        jobId: job._id,
      }));
    } else if (recommendedJobs.length === 0) {
      recommendedJobs = careerRoles.slice(0, 3).map((role, index) => ({
        id: index + 1,
        title: role,
        matchScore: Math.max(55, 85 - index * 8),
        salaryRange: '$60,000 - $120,000',
        whyMatch: `Aligned with your ${careerPath || 'current'} skill progression and credential profile.`,
      }));
    }

    if (recommendedCertifications.length === 0) {
      const baseCerts = careerPath ? [
        `${careerPath} Professional Certification`,
        `Advanced ${careerPath} Practitioner`,
        `${careerPath} Associate Certificate`,
      ] : [
        'Cloud Fundamentals Certification',
        'Data Analytics Associate Certification',
        'Agile Foundations Certification',
      ];

      recommendedCertifications = baseCerts.map((name, index) => ({
        id: index + 1,
        name,
        provider: ['Coursera', 'edX', 'Udemy'][index % 3],
        level: index === 0 ? 'Intermediate' : 'Beginner',
        reason: 'Bridges your current skill profile to role-ready outcomes.',
      }));
    }

    if (portfolioSuggestions.length === 0) {
      portfolioSuggestions = [
        'Create 2 case-study projects that demonstrate problem solving and measurable outcomes.',
        'Publish one role-focused portfolio section with skill evidence and credential links.',
        'Add a concise learning roadmap that highlights recent and planned certifications.',
      ];
    }

    if (skillMapInsights.length === 0) {
      const topGap = skillGaps[0];
      skillMapInsights = [
        topGap
          ? `Your largest skill gap is ${topGap.name}; prioritize this to improve role match quickly.`
          : 'Your core skill map is balanced for the selected target role.',
        `You currently have ${skillAnalysis.totalSkills || 0} tracked skills across verified credentials.`,
        'Consistent weekly project work can significantly improve your proficiency score.',
      ];
    }

    if (!recommendationSummary) {
      recommendationSummary = `Focus on ${skillGaps.length > 0 ? skillGaps[0].name : 'advanced project execution'} to improve readiness for ${careerPath || 'your next role'}.`;
    }

    res.json({
      skillGaps,
      courses,
      projects,
      careerRoles,
      recommendedJobs,
      recommendedCertifications,
      portfolioSuggestions,
      skillMapInsights,
      recommendationSummary,
      proficiency: targetSkills.length > 0
        ? Math.round(
            targetSkills.reduce((sum, target) => {
              const current = userSkillMap[target.name.toLowerCase()] || 0;
              return sum + skillService.calculateProficiency(current, target.level);
            }, 0) / targetSkills.length
          )
        : 100,
      aiEnabled,
      aiMetadata,
      generatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

// GET /recommendations/career-paths
export const getCareerPaths = async (req, res, next) => {
  try {
    const careerPaths = [
      {
        id: 1,
        name: 'Full Stack Developer',
        description: 'Build complete web applications from frontend to backend',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        averageSalary: '$80,000 - $120,000',
        demand: 'High',
      },
      {
        id: 2,
        name: 'Data Scientist',
        description: 'Analyze data and build machine learning models',
        requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL'],
        averageSalary: '$90,000 - $140,000',
        demand: 'Very High',
      },
      {
        id: 3,
        name: 'DevOps Engineer',
        description: 'Automate and optimize software deployment and infrastructure',
        requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
        averageSalary: '$85,000 - $130,000',
        demand: 'High',
      },
      {
        id: 4,
        name: 'Mobile Developer',
        description: 'Create mobile applications for iOS and Android',
        requiredSkills: ['React Native', 'Flutter', 'Mobile UI/UX'],
        averageSalary: '$75,000 - $115,000',
        demand: 'High',
      },
      {
        id: 5,
        name: 'Cloud Architect',
        description: 'Design and implement cloud infrastructure solutions',
        requiredSkills: ['AWS', 'Azure', 'Cloud Security', 'Microservices'],
        averageSalary: '$100,000 - $160,000',
        demand: 'Very High',
      },
    ];

    res.json({ careerPaths });
  } catch (error) {
    next(error);
  }
};

// POST /recommendations/extract-skills
export const extractSkillsFromText = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        extractedSkills: [],
        count: 0,
        valid: false,
        reason: 'No certificate or insufficient data',
      });
    }

    let extractedSkills = [];
    let valid = false;
    let reason;

    if (aiService.isAIConfigured()) {
      try {
        const result = await aiService.extractSkillsVerified(text);
        extractedSkills = result.skills || [];
        valid = Boolean(result.valid);
        reason = result.reason;
      } catch (aiError) {
        logger.warn('AI skill extraction failed:', aiError.message);
      }
    }

    res.json({
      extractedSkills,
      count: extractedSkills.length,
      valid,
      ...(extractedSkills.length === 0 && {
        reason: reason || 'No certificate or insufficient data',
      }),
    });
  } catch (error) {
    next(error);
  }
};

// GET /recommendations/jobs/relevant
export const getRelevantJobs = async (req, res, next) => {
  try {
    if (req.user.role !== 'Learner') {
      return res.status(403).json({ error: 'Only learners can access relevant job recommendations' });
    }

    const { minMatch = 55, page = 1, limit = 20 } = req.query;
    const result = await getRelevantJobsForUser(req.user.userId, {
      minMatch: Math.min(Math.max(parseInt(minMatch, 10) || 55, 1), 100),
      page,
      limit,
      includeApplied: false,
    });

    if (!result.profile) {
      return res.status(404).json({ error: 'Learner profile not found' });
    }

    res.json({
      jobs: result.jobs,
      skillSummary: {
        totalSkills: result.skillAnalysis.totalSkills,
        topSkills: result.skillAnalysis.skills.slice(0, 8),
        nsqfLevel: result.profile.nsqfLevel,
      },
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages,
        limit: result.limit,
      },
      scanTimestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /recommendations/jobs/:jobId/apply
export const applyToRelevantJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'Learner') {
      return res.status(403).json({ error: 'Only learners can apply to jobs' });
    }

    const { jobId } = req.params;
    const { coverLetter = '', resume = '', minMatch = 50 } = req.body;

    const [profile, skillAnalysis, job] = await Promise.all([
      LearnerProfile.findOne({ userId: req.user.userId }).lean(),
      skillService.analyzeUserSkills(req.user.userId),
      Job.findOne({ _id: jobId, status: 'open' }).populate('employerId', 'userId companyName'),
    ]);

    if (!profile) {
      return res.status(404).json({ error: 'Learner profile not found' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Open job not found' });
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({ error: 'Application deadline has passed for this job' });
    }

    const existingApplication = await Application.findOne({
      jobId: job._id,
      learnerId: req.user.userId,
    });

    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    const userSkillMap = buildSkillMap(skillAnalysis.skills);
    const match = scoreJobRelevance(job, userSkillMap, profile.nsqfLevel);
    const requiredMatch = Math.min(Math.max(parseInt(minMatch, 10) || 50, 1), 100);

    if (!match.isRelevant || match.matchScore < requiredMatch) {
      return res.status(403).json({
        error: 'This job is not relevant enough for your current skill profile',
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      });
    }

    const application = await Application.create({
      jobId: job._id,
      learnerId: req.user.userId,
      employerId: job.employerId._id,
      coverLetter,
      resume,
      status: 'applied',
      statusHistory: [{
        status: 'applied',
        changedAt: new Date(),
        changedBy: req.user.userId,
      }],
    });

    await Job.updateOne(
      { _id: job._id },
      { $inc: { totalApplications: 1 } }
    );

    if (job.employerId?.userId) {
      try {
        await sendNotification(
          req.app,
          job.employerId.userId,
          'System',
          `${req.user.name} applied for ${job.title}`,
          {
            jobId: job._id,
            applicationId: application._id,
            learnerId: req.user.userId,
            matchScore: match.matchScore,
          }
        );
      } catch (notifyError) {
        logger.warn('Failed to notify employer about job application:', notifyError.message);
      }
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      matchScore: match.matchScore,
      matchedSkills: match.matchedSkills,
    });
  } catch (error) {
    next(error);
  }
};

// GET /recommendations/jobs/applications
export const getMyApplications = async (req, res, next) => {
  try {
    if (req.user.role !== 'Learner') {
      return res.status(403).json({ error: 'Only learners can access application tracker' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const filter = { learnerId: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'jobId',
          select: 'title location locationType employmentType salaryRange status applicationDeadline employerId',
          populate: {
            path: 'employerId',
            select: 'companyName location industry',
          },
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Application.countDocuments(filter),
    ]);

    const trackerItems = applications.map((application) => ({
      applicationId: application._id,
      status: application.status,
      appliedAt: application.appliedAt,
      lastUpdated: application.updatedAt,
      employerNotes: application.employerNotes || '',
      rating: application.rating,
      job: application.jobId
        ? {
            jobId: application.jobId._id,
            title: application.jobId.title,
            location: application.jobId.location,
            locationType: application.jobId.locationType,
            employmentType: application.jobId.employmentType,
            salaryRange: application.jobId.salaryRange,
            applicationDeadline: application.jobId.applicationDeadline,
          }
        : null,
      employer: application.jobId?.employerId
        ? {
            employerId: application.jobId.employerId._id,
            companyName: application.jobId.employerId.companyName,
            industry: application.jobId.employerId.industry,
            location: application.jobId.employerId.location,
          }
        : null,
      timeline: application.statusHistory || [],
    }));

    res.json({
      applications: trackerItems,
      pagination: {
        total,
        page: safePage,
        pages: Math.ceil(total / safeLimit),
        limit: safeLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /recommendations/jobs/applications/:applicationId/withdraw
export const withdrawMyApplication = async (req, res, next) => {
  try {
    if (req.user.role !== 'Learner') {
      return res.status(403).json({ error: 'Only learners can withdraw applications' });
    }

    const { applicationId } = req.params;
    const application = await Application.findOne({
      _id: applicationId,
      learnerId: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({
        error: `Application cannot be withdrawn from '${application.status}' status`,
      });
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

export default {
  analyzeSkills,
  calculateSkillGap,
  generateRecommendations,
  getCareerPaths,
  extractSkillsFromText,
  getRelevantJobs,
  applyToRelevantJob,
  getMyApplications,
  withdrawMyApplication,
};
