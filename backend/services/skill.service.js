import Credential from '../models/Credential.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import logger from '../utils/logger.js';

/**
 * Calculate skill gap between user's current skills and target skills
 * @param {Object} userSkills - Object with skill names as keys and levels as values
 * @param {Array} targetSkills - Array of target skills with required levels
 * @returns {Array} - Array of skill gaps
 */
export const calculateSkillGap = (userSkills, targetSkills) => {
  const gaps = [];

  targetSkills.forEach(skill => {
    const userLevel = userSkills[skill.name] || 0;

    if (userLevel < skill.level) {
      gaps.push({
        name: skill.name,
        required: skill.level,
        current: userLevel,
        gap: skill.level - userLevel,
      });
    }
  });

  return gaps;
};

/**
 * Analyze user's skills from their credentials
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Skill analysis with levels
 */
export const analyzeUserSkills = async (userId) => {
  try {
    // Get all verified credentials
    const credentials = await Credential.find({
      userId,
      verificationStatus: 'verified',
    }).sort({ issueDate: -1 });

    // Extract all skills
    const skillMap = {};
    const skillFrequency = {};

    credentials.forEach(credential => {
      credential.skills.forEach(skill => {
        const normalizedSkill = skill.trim().toLowerCase();
        
        // Count frequency
        skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1;
        
        // Calculate level based on frequency and NSQF level
        const currentLevel = skillMap[normalizedSkill] || 0;
        const newLevel = Math.min(
          currentLevel + (credential.nsqfLevel || 1),
          10
        );
        skillMap[normalizedSkill] = newLevel;
      });
    });

    // Convert to array format
    const skills = Object.keys(skillMap).map(skill => ({
      name: skill,
      level: skillMap[skill],
      frequency: skillFrequency[skill],
      lastUsed: credentials.find(c => 
        c.skills.some(s => s.toLowerCase() === skill)
      )?.issueDate || new Date(),
    }));

    // Sort by level (descending)
    skills.sort((a, b) => b.level - a.level);

    return {
      skills,
      totalSkills: skills.length,
      averageLevel: skills.length > 0 
        ? skills.reduce((sum, s) => sum + s.level, 0) / skills.length 
        : 0,
    };
  } catch (error) {
    logger.error('Skill analysis error:', error.message);
    throw error;
  }
};

/**
 * Get skill recommendations based on career path
 * @param {string} careerPath - Target career path
 * @returns {Array} - Recommended skills with target levels
 */
export const getCareerPathSkills = (careerPath) => {
  const careerSkills = {
    'Full Stack Developer': [
      { name: 'JavaScript', level: 8 },
      { name: 'React', level: 7 },
      { name: 'Node.js', level: 7 },
      { name: 'MongoDB', level: 6 },
      { name: 'REST APIs', level: 7 },
      { name: 'Git', level: 6 },
    ],
    'Data Scientist': [
      { name: 'Python', level: 8 },
      { name: 'Machine Learning', level: 7 },
      { name: 'Statistics', level: 7 },
      { name: 'SQL', level: 6 },
      { name: 'Data Visualization', level: 6 },
      { name: 'TensorFlow', level: 6 },
    ],
    'DevOps Engineer': [
      { name: 'Docker', level: 7 },
      { name: 'Kubernetes', level: 7 },
      { name: 'CI/CD', level: 7 },
      { name: 'AWS', level: 6 },
      { name: 'Linux', level: 7 },
      { name: 'Terraform', level: 6 },
    ],
    'Mobile Developer': [
      { name: 'React Native', level: 7 },
      { name: 'Flutter', level: 7 },
      { name: 'iOS Development', level: 6 },
      { name: 'Android Development', level: 6 },
      { name: 'Mobile UI/UX', level: 6 },
      { name: 'API Integration', level: 6 },
    ],
    'Cloud Architect': [
      { name: 'AWS', level: 8 },
      { name: 'Azure', level: 7 },
      { name: 'Cloud Security', level: 7 },
      { name: 'Microservices', level: 7 },
      { name: 'Serverless', level: 6 },
      { name: 'Infrastructure as Code', level: 7 },
    ],
  };

  return careerSkills[careerPath] || [];
};

/**
 * Calculate skill proficiency percentage
 * @param {number} currentLevel - Current skill level
 * @param {number} targetLevel - Target skill level
 * @returns {number} - Proficiency percentage
 */
export const calculateProficiency = (currentLevel, targetLevel) => {
  if (targetLevel === 0) return 100;
  return Math.min(Math.round((currentLevel / targetLevel) * 100), 100);
};

/**
 * Get trending skills based on recent credentials
 * @returns {Promise<Array>} - Trending skills
 */
export const getTrendingSkills = async () => {
  try {
    // Get credentials from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentCredentials = await Credential.find({
      createdAt: { $gte: sixMonthsAgo },
      verificationStatus: 'verified',
    });

    // Count skill frequency
    const skillCount = {};
    recentCredentials.forEach(credential => {
      credential.skills.forEach(skill => {
        const normalized = skill.trim().toLowerCase();
        skillCount[normalized] = (skillCount[normalized] || 0) + 1;
      });
    });

    // Convert to array and sort
    const trending = Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return trending;
  } catch (error) {
    logger.error('Trending skills error:', error.message);
    return [];
  }
};

/**
 * Generate skill development roadmap
 * @param {Array} currentSkills - User's current skills
 * @param {Array} targetSkills - Target skills for career path
 * @returns {Object} - Skill development roadmap
 */
export const generateSkillRoadmap = (currentSkills, targetSkills) => {
  const roadmap = {
    immediate: [], // Skills to learn now (0-3 months)
    shortTerm: [], // Skills to learn next (3-6 months)
    longTerm: [], // Skills to learn later (6-12 months)
  };

  const userSkillMap = {};
  currentSkills.forEach(skill => {
    userSkillMap[skill.name.toLowerCase()] = skill.level;
  });

  targetSkills.forEach(target => {
    const currentLevel = userSkillMap[target.name.toLowerCase()] || 0;
    const gap = target.level - currentLevel;

    if (gap > 0) {
      const skillItem = {
        name: target.name,
        currentLevel,
        targetLevel: target.level,
        gap,
      };

      if (gap <= 2) {
        roadmap.immediate.push(skillItem);
      } else if (gap <= 4) {
        roadmap.shortTerm.push(skillItem);
      } else {
        roadmap.longTerm.push(skillItem);
      }
    }
  });

  return roadmap;
};

export default {
  calculateSkillGap,
  analyzeUserSkills,
  getCareerPathSkills,
  calculateProficiency,
  getTrendingSkills,
  generateSkillRoadmap,
};
