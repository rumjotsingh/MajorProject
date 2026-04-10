import axios from 'axios';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4';

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const sanitizeStringList = (items, maxItems = 5) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, maxItems);
};

const requestOllamaText = async (prompt) => {
  const response = await axios.post(
    `${OLLAMA_BASE_URL}/api/generate`,
    {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    },
    {
      timeout: Number(process.env.OLLAMA_TIMEOUT_MS || 120000),
    }
  );

  return {
    text: response?.data?.response || '',
    usageMetadata: null,
    modelVersion: response?.data?.model || OLLAMA_MODEL,
    responseId: null,
  };
};

const requestAIText = async (prompt) => {
  const result = await requestOllamaText(prompt);

  return {
    ...result,
    provider: 'ollama',
  };
};

/**
 * Generate AI response using Ollama
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} - Generated text response
 */
export const generateAIResponse = async (prompt) => {
  try {
    const result = await requestAIText(prompt);
    if (!result.text) {
      throw new Error('Empty response from AI provider');
    }
    return result.text;
  } catch (error) {
    logger.error('AI Service Error:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      provider: 'ollama',
    });
    throw error;
  }
};

/**
 * Extract skills from credential text using AI
 * @param {string} credentialText - Text describing the credential
 * @returns {Promise<string[]>} - Array of extracted skills
 */
export const extractSkillsVerified = async (certificateText) => {
  if (!certificateText || typeof certificateText !== 'string' || certificateText.trim().length === 0) {
    return {
      skills: [],
      valid: false,
      reason: 'No certificate or insufficient data',
    };
  }

  const prompt = `You are a strict verification-based skill extraction system.

Rules:
1. Only extract skills if they are clearly mentioned in the certificate.
2. If no certificate or no valid content is provided, return an empty skills array.
3. Do NOT guess or assume skills.
4. Do NOT add generic skills.

Input:
${certificateText}

Output JSON:
{
  "skills": [],
  "valid": true/false,
  "reason": "No certificate or insufficient data" (if empty)
}`;

  try {
    const response = await generateAIResponse(prompt);
    const parsed = safeJsonParse(response);

    const extractedSkills = sanitizeStringList(parsed?.skills, 25)
      .filter((skill) => skill.length < 60);

    const hasSkills = extractedSkills.length > 0;

    return {
      skills: extractedSkills,
      valid: hasSkills ? true : Boolean(parsed?.valid) && false,
      reason: hasSkills
        ? undefined
        : (typeof parsed?.reason === 'string' && parsed.reason.trim())
          ? parsed.reason.trim()
          : 'No certificate or insufficient data',
    };
  } catch (error) {
    return {
      skills: [],
      valid: false,
      reason: 'No certificate or insufficient data',
    };
  }
};

export const extractSkills = async (credentialText) => {
  const result = await extractSkillsVerified(credentialText);
  return result.skills;
};

export const isAIConfigured = () => {
  return true;
};

export const generateUnifiedRecommendations = async ({
  careerPath,
  userSkills,
  skillGaps,
  nsqfLevel,
  totalCredentials,
  totalCredits,
}) => {
  const skillSummary = userSkills
    .slice(0, 12)
    .map((skill) => `${skill.name} (Level ${skill.level})`)
    .join(', ');

  const gapsSummary = skillGaps
    .slice(0, 8)
    .map((gap) => `${gap.name}: current ${gap.current}, target ${gap.required}`)
    .join('; ');

  const prompt = `You are an AI career advisor for a credential platform.
Generate concise and practical recommendations.

User context:
- Target career path: ${careerPath || 'Not specified'}
- NSQF level: ${nsqfLevel}
- Total credentials: ${totalCredentials}
- Total credits: ${totalCredits}
- Current skills: ${skillSummary || 'None'}
- Skill gaps: ${gapsSummary || 'No major gaps'}

Return ONLY JSON with this exact shape:
{
  "careerRoles": ["..."],
  "courses": [{"title": "...", "platform": "...", "targetSkill": "...", "duration": "..."}],
  "projects": [{"title": "...", "difficulty": "Beginner|Intermediate|Advanced", "skills": ["..."], "estimatedTime": "..."}],
  "recommendedJobs": [{"title": "...", "matchScore": 0, "salaryRange": "...", "whyMatch": "..."}],
  "recommendedCertifications": [{"name": "...", "provider": "...", "level": "...", "reason": "..."}],
  "portfolioSuggestions": ["..."],
  "skillMapInsights": ["..."],
  "summary": "..."
}

Rules:
- careerRoles: max 5
- courses: max 5
- projects: max 5
- recommendedJobs: max 6
- recommendedCertifications: max 6
- portfolioSuggestions: max 6
- skillMapInsights: max 6
- Keep text short and actionable.`;

  const result = await requestAIText(prompt);
  const parsed = safeJsonParse(result.text) || {};

  const courses = Array.isArray(parsed.courses)
    ? parsed.courses
        .map((course) => ({
          title: String(course?.title || '').trim(),
          platform: String(course?.platform || 'Online Platform').trim(),
          targetSkill: String(course?.targetSkill || '').trim(),
          duration: String(course?.duration || '').trim(),
        }))
        .filter((course) => course.title)
        .slice(0, 5)
    : [];

  const projects = Array.isArray(parsed.projects)
    ? parsed.projects
        .map((project) => ({
          title: String(project?.title || '').trim(),
          difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(project?.difficulty)
            ? project.difficulty
            : 'Intermediate',
          skills: sanitizeStringList(project?.skills, 6),
          estimatedTime: String(project?.estimatedTime || '').trim(),
        }))
        .filter((project) => project.title)
        .slice(0, 5)
    : [];

  const recommendedJobs = Array.isArray(parsed.recommendedJobs)
    ? parsed.recommendedJobs
        .map((job) => ({
          title: String(job?.title || '').trim(),
          matchScore: Number(job?.matchScore) || 0,
          salaryRange: String(job?.salaryRange || '').trim(),
          whyMatch: String(job?.whyMatch || '').trim(),
        }))
        .filter((job) => job.title)
        .slice(0, 6)
    : [];

  const recommendedCertifications = Array.isArray(parsed.recommendedCertifications)
    ? parsed.recommendedCertifications
        .map((cert) => ({
          name: String(cert?.name || '').trim(),
          provider: String(cert?.provider || '').trim(),
          level: String(cert?.level || '').trim(),
          reason: String(cert?.reason || '').trim(),
        }))
        .filter((cert) => cert.name)
        .slice(0, 6)
    : [];

  return {
    careerRoles: sanitizeStringList(parsed.careerRoles, 5),
    courses,
    projects,
    recommendedJobs,
    recommendedCertifications,
    portfolioSuggestions: sanitizeStringList(parsed.portfolioSuggestions, 6),
    skillMapInsights: sanitizeStringList(parsed.skillMapInsights, 6),
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
    aiMetadata: {
      provider: result.provider,
      model: result.modelVersion,
      responseId: result.responseId,
      usageMetadata: result.usageMetadata,
    },
  };
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
  isAIConfigured,
  generateUnifiedRecommendations,
  generateCareerRecommendations,
  generateCourseRecommendations,
  generateProjectRecommendations,
};
