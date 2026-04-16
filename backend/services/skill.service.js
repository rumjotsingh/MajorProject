import Credential from '../models/Credential.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import logger from '../utils/logger.js';

// Canonical skill name aliases — maps any variant to the canonical name
const SKILL_ALIASES = {
  // JavaScript variants
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'java script': 'JavaScript',
  'es6': 'JavaScript',
  'es2015': 'JavaScript',
  'ecmascript': 'JavaScript',
  'vanilla js': 'JavaScript',
  'vanillajs': 'JavaScript',
  // TypeScript
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  // Node.js
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node js': 'Node.js',
  // React
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'react js': 'React',
  // Python
  'python': 'Python',
  'python3': 'Python',
  'py': 'Python',
  // MongoDB
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'mongo db': 'MongoDB',
  // SQL
  'sql': 'SQL',
  'mysql': 'SQL',
  'postgresql': 'SQL',
  'postgres': 'SQL',
  // AWS
  'aws': 'AWS',
  'amazon web services': 'AWS',
  // Docker
  'docker': 'Docker',
  // Kubernetes
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  // Git
  'git': 'Git',
  'github': 'Git',
  'gitlab': 'Git',
  // REST APIs
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  'restful': 'REST APIs',
  'restful api': 'REST APIs',
  'api': 'REST APIs',
  // Machine Learning
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  // CI/CD
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'ci cd': 'CI/CD',
  'continuous integration': 'CI/CD',
  // Flutter
  'flutter': 'Flutter',
  // React Native
  'react native': 'React Native',
  'reactnative': 'React Native',
  // Azure
  'azure': 'Azure',
  'microsoft azure': 'Azure',
};

/**
 * Normalize a skill name to its canonical form (case-insensitive + alias resolution)
 */
export const normalizeSkillName = (skill) => {
  const lower = skill.trim().toLowerCase();
  return SKILL_ALIASES[lower] || skill.trim();
};

/**
 * Calculate skill gap between user's current skills and target skills
 * Uses case-insensitive comparison via lowercase keys
 */
export const calculateSkillGap = (userSkills, targetSkills) => {
  // Build a lowercase lookup map from userSkills
  const userSkillLower = {};
  Object.entries(userSkills).forEach(([key, val]) => {
    userSkillLower[key.toLowerCase()] = val;
  });

  const gaps = [];
  targetSkills.forEach(skill => {
    // Try canonical name lowercase, then alias lookup
    const canonicalLower = skill.name.toLowerCase();
    const userLevel = userSkillLower[canonicalLower] || 0;

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
 * Skills are normalized via alias map so "js", "JS", "javascript" all count as "JavaScript"
 */
export const analyzeUserSkills = async (userId) => {
  try {
    const credentials = await Credential.find({
      userId,
      verificationStatus: 'verified',
    }).sort({ issueDate: -1 });

    // skillMap keyed by LOWERCASE canonical name → { canonicalName, level, frequency }
    const skillMap = {};

    credentials.forEach(credential => {
      credential.skills.forEach(rawSkill => {
        const canonical = normalizeSkillName(rawSkill);   // e.g. "js" → "JavaScript"
        const key = canonical.toLowerCase();              // lookup key

        skillMap[key] = skillMap[key] || { name: canonical, level: 0, frequency: 0 };
        skillMap[key].frequency += 1;
        skillMap[key].level = Math.min(
          skillMap[key].level + (credential.nsqfLevel || 1),
          10
        );
      });
    });

    const skills = Object.values(skillMap)
      .map(s => ({
        name: s.name,
        level: s.level,
        frequency: s.frequency,
      }))
      .sort((a, b) => b.level - a.level);

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
 * @returns {Promise<Array>} - Recommended skills with target levels
 */
export const getCareerPathSkills = async (careerPath) => {
  try {
    const CareerPath = (await import('../models/CareerPath.model.js')).default;
    
    // Try to find the career path in database
    const path = await CareerPath.findOne({ 
      title: { $regex: new RegExp(`^${careerPath.trim()}$`, 'i') } 
    }).lean();
    
    if (path && path.requiredSkills && path.requiredSkills.length > 0) {
      // Convert skills to format with levels
      return path.requiredSkills.map(skill => ({
        name: skill,
        level: 7, // Default level for required skills
      }));
    }
    
    // Fallback to hardcoded skills if not found in database
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
        { name: 'Pandas', level: 6 },
      ],
      'UI/UX Designer': [
        { name: 'Figma', level: 8 },
        { name: 'User Research', level: 7 },
        { name: 'Wireframing', level: 7 },
        { name: 'Prototyping', level: 7 },
        { name: 'Design Systems', level: 6 },
        { name: 'HTML/CSS', level: 6 },
      ],
      'DevOps Engineer': [
        { name: 'Docker', level: 7 },
        { name: 'Kubernetes', level: 7 },
        { name: 'CI/CD', level: 7 },
        { name: 'AWS', level: 6 },
        { name: 'Linux', level: 7 },
        { name: 'Terraform', level: 6 },
      ],
      'Mobile App Developer': [
        { name: 'React Native', level: 7 },
        { name: 'Flutter', level: 7 },
        { name: 'Swift', level: 6 },
        { name: 'Kotlin', level: 6 },
        { name: 'Mobile UI', level: 6 },
        { name: 'REST APIs', level: 6 },
      ],
      'Cybersecurity Analyst': [
        { name: 'Network Security', level: 8 },
        { name: 'Penetration Testing', level: 7 },
        { name: 'SIEM', level: 7 },
        { name: 'Incident Response', level: 7 },
        { name: 'Cryptography', level: 6 },
        { name: 'Linux', level: 6 },
      ],
      'Cloud Architect': [
        { name: 'AWS', level: 8 },
        { name: 'Azure', level: 7 },
        { name: 'Cloud Architecture', level: 8 },
        { name: 'Microservices', level: 7 },
        { name: 'Networking', level: 7 },
        { name: 'Security', level: 7 },
      ],
      'Product Manager': [
        { name: 'Product Strategy', level: 8 },
        { name: 'User Research', level: 7 },
        { name: 'Agile', level: 7 },
        { name: 'Data Analysis', level: 7 },
        { name: 'Roadmapping', level: 7 },
        { name: 'Stakeholder Management', level: 7 },
      ],
    };

    return careerSkills[careerPath] || [];
  } catch (error) {
    logger.error('Get career path skills error:', error.message);
    return [];
  }
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
  const roadmap = { immediate: [], shortTerm: [], longTerm: [] };

  const userSkillMap = {};
  currentSkills.forEach(skill => {
    userSkillMap[skill.name.toLowerCase()] = skill.level;
  });

  targetSkills.forEach(target => {
    // Case-insensitive lookup
    const currentLevel = userSkillMap[target.name.toLowerCase()] || 0;
    const gap = target.level - currentLevel;

    if (gap > 0) {
      const skillItem = { name: target.name, currentLevel, targetLevel: target.level, gap };
      if (gap <= 2) roadmap.immediate.push(skillItem);
      else if (gap <= 4) roadmap.shortTerm.push(skillItem);
      else roadmap.longTerm.push(skillItem);
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
