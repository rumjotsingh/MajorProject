import Credential from '../models/Credential.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import * as aiService from '../services/ai.service.js';
import * as skillService from '../services/skill.service.js';
import logger from '../utils/logger.js';

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
    let aiEnabled = false;

    // Try AI-powered recommendations only if API key is configured and AI is available
    const hasValidApiKey = process.env.HF_API_KEY && 
                          process.env.HF_API_KEY !== 'your-huggingface-api-key' &&
                          process.env.HF_API_KEY.startsWith('hf_');

    // Note: AI is currently disabled due to 2026 HF API migration
    // Models are not available on serverless provider
    // System uses comprehensive fallback recommendations
    if (hasValidApiKey && false) { // AI disabled until models are available
      try {
        logger.info('Attempting AI-powered recommendations...');
        
        // Try each AI service independently with individual error handling
        try {
          courses = await aiService.generateCourseRecommendations(skillGaps.slice(0, 3));
          if (courses && courses.length > 0) {
            aiEnabled = true;
          }
        } catch (err) {
          courses = [];
        }

        try {
          projects = await aiService.generateProjectRecommendations(
            skillAnalysis.skills.slice(0, 5),
            skillGaps.slice(0, 3)
          );
          if (projects && projects.length > 0) {
            aiEnabled = true;
          }
        } catch (err) {
          projects = [];
        }

        try {
          careerRoles = await aiService.generateCareerRecommendations(
            skillAnalysis.skills.slice(0, 5),
            profile.nsqfLevel
          );
          if (careerRoles && careerRoles.roles && careerRoles.roles.length > 0) {
            aiEnabled = true;
          }
        } catch (err) {
          careerRoles = { roles: [] };
        }

        if (aiEnabled) {
          logger.info('AI recommendations generated successfully');
        } else {
          logger.info('AI recommendations unavailable, using fallback');
        }
      } catch (aiError) {
        logger.info('Using fallback recommendations');
      }
    } else {
      logger.info('Using fallback recommendations (API key not configured)');
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

    if (!careerRoles.roles || careerRoles.roles.length === 0) {
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

      careerRoles = {
        roles: rolesByPath[careerPath] || [
          careerPath || 'Software Developer',
          `Senior ${careerPath || 'Software Developer'}`,
          `Lead ${careerPath || 'Software Developer'}`,
        ],
        generatedAt: new Date(),
      };
    }

    res.json({
      skillGaps,
      courses,
      projects,
      careerRoles: careerRoles.roles,
      proficiency: targetSkills.length > 0
        ? Math.round(
            targetSkills.reduce((sum, target) => {
              const current = userSkillMap[target.name.toLowerCase()] || 0;
              return sum + skillService.calculateProficiency(current, target.level);
            }, 0) / targetSkills.length
          )
        : 100,
      aiEnabled,
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
      return res.status(400).json({ error: 'Text is required' });
    }

    // Try AI extraction if available
    let extractedSkills = [];
    
    if (process.env.HF_API_KEY) {
      try {
        extractedSkills = await aiService.extractSkills(text);
      } catch (aiError) {
        logger.warn('AI skill extraction failed:', aiError.message);
      }
    }

    // Fallback: simple keyword extraction
    if (extractedSkills.length === 0) {
      const commonSkills = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB',
        'SQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning',
        'Data Science', 'DevOps', 'CI/CD', 'Git', 'REST API',
      ];

      extractedSkills = commonSkills.filter(skill =>
        text.toLowerCase().includes(skill.toLowerCase())
      );
    }

    res.json({
      extractedSkills,
      count: extractedSkills.length,
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
};
