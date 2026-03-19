import axios from 'axios';
import logger from '../utils/logger.js';
import dotenv from "dotenv"
dotenv.config();
// Hugging Face Router API (2026 migration)
// NOTE: Many models are not available on serverless HF Inference provider
// The system uses comprehensive fallback recommendations when AI is unavailable
const HF_MODEL = "google/flan-t5-base";

const HF_API = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
// Flag to disable AI attempts if model is not available
const AI_AVAILABLE = false; // Set to true when a working model is confirmed

/**
 * Generate AI response using Hugging Face API
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} - Generated text response
 */
export const generateAIResponse = async (prompt) => {
  // Skip AI if not available (model not deployed on serverless provider)
  if (!AI_AVAILABLE) {
    throw new Error('AI model not available on serverless provider');
  }

  try {
    if (!HF_API_KEY) {
      throw new Error('HF_API_KEY not configured');
    }

    const response = await axios.post(
      HF_API,
      { 
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
        },
        options: {
          wait_for_model: true,
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Handle response format from router API
    if (Array.isArray(response.data)) {
      if (response.data[0]?.generated_text) {
        return response.data[0].generated_text;
      }
    } else if (response.data?.generated_text) {
      return response.data.generated_text;
    } else if (typeof response.data === 'string') {
      return response.data;
    }

    throw new Error('Invalid response format from AI service');
  } catch (error) {
    if (error.response) {
      logger.error('AI Service Error:', {
        status: error.response.status,
        data: error.response.data,
        timestamp: new Date().toISOString(),
      });
    } else if (error.message !== 'AI model not available on serverless provider') {
      logger.error('AI Service Error:', {
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    throw error;
  }
};

/**
 * Extract skills from credential text using AI
 * @param {string} credentialText - Text describing the credential
 * @returns {Promise<string[]>} - Array of extracted skills
 */
export const extractSkills = async (credentialText) => {
  const prompt = `Extract technical skills from this credential description. Return only skill names separated by commas:
  
Credential: ${credentialText}

Skills:`;

  try {
    const response = await generateAIResponse(prompt);
    const skills = response
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50);
    
    return skills;
  } catch (error) {
    // Silent fail for optional AI feature
    return [];
  }
};

/**
 * Analyze skill level based on credentials
 * @param {string} skill - Skill name
 * @param {Array} credentials - User's credentials
 * @returns {Promise<number>} - Skill level (1-10)
 */
export const analyzeSkillLevel = async (skill, credentials) => {
  const credentialText = credentials
    .map(c => `${c.title} (${c.skills.join(', ')})`)
    .join('; ');

  const prompt = `Based on these credentials, rate the skill level for "${skill}" from 1 to 10:

Credentials: ${credentialText}

Skill: ${skill}
Level (1-10):`;

  try {
    const response = await generateAIResponse(prompt);
    const level = parseInt(response.match(/\d+/)?.[0] || '1');
    return Math.min(Math.max(level, 1), 10);
  } catch (error) {
    // Silent fail for optional AI feature
    return 1;
  }
};

/**
 * Generate career path recommendations
 * @param {Array} userSkills - User's current skills with levels
 * @param {number} nsqfLevel - User's NSQF level
 * @returns {Promise<Object>} - Career recommendations
 */
export const generateCareerRecommendations = async (userSkills, nsqfLevel) => {
  const skillsList = userSkills.map(s => `${s.name} (Level ${s.level})`).join(', ');

  const prompt = `Based on these skills and NSQF Level ${nsqfLevel}, suggest 3 career roles:

Skills: ${skillsList}

Provide 3 career roles with brief descriptions:`;

  try {
    const response = await generateAIResponse(prompt);
    return {
      roles: response.split('\n').filter(r => r.trim().length > 0).slice(0, 3),
      generatedAt: new Date(),
    };
  } catch (error) {
    // Throw to trigger fallback in controller
    throw error;
  }
};

/**
 * Generate course recommendations for skill gaps
 * @param {Array} skillGaps - Array of skill gaps
 * @returns {Promise<Array>} - Recommended courses
 */
export const generateCourseRecommendations = async (skillGaps) => {
  const gapsList = skillGaps.map(g => `${g.name} (need level ${g.required}, have ${g.current})`).join(', ');

  const prompt = `Recommend online courses to fill these skill gaps:

Gaps: ${gapsList}

Suggest 3 courses with platforms:`;

  try {
    const response = await generateAIResponse(prompt);
    const courses = response
      .split('\n')
      .filter(c => c.trim().length > 0)
      .slice(0, 3)
      .map((course, index) => ({
        id: index + 1,
        title: course.trim(),
        platform: 'Online Learning Platform',
      }));
    
    return courses;
  } catch (error) {
    // Throw to trigger fallback in controller
    throw error;
  }
};

/**
 * Generate project recommendations
 * @param {Array} userSkills - User's current skills
 * @param {Array} skillGaps - Skill gaps to address
 * @returns {Promise<Array>} - Recommended projects
 */
export const generateProjectRecommendations = async (userSkills, skillGaps) => {
  const skillsList = userSkills.map(s => s.name).join(', ');
  const gapsList = skillGaps.map(g => g.name).join(', ');

  const prompt = `Suggest 3 practical projects to improve these skills:

Current Skills: ${skillsList}
Skills to Improve: ${gapsList}

Projects:`;

  try {
    const response = await generateAIResponse(prompt);
    const projects = response
      .split('\n')
      .filter(p => p.trim().length > 0)
      .slice(0, 3)
      .map((project, index) => ({
        id: index + 1,
        title: project.trim(),
        difficulty: skillGaps.length > 3 ? 'Advanced' : 'Intermediate',
      }));
    
    return projects;
  } catch (error) {
    // Throw to trigger fallback in controller
    throw error;
  }
};

export default {
  generateAIResponse,
  extractSkills,
  analyzeSkillLevel,
  generateCareerRecommendations,
  generateCourseRecommendations,
  generateProjectRecommendations,
};
