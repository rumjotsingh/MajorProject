// NSQF Level definitions
const NSQF_LEVELS = [
  { level: 1, description: 'Basic/Foundation', minCredits: 0, maxCredits: 40 },
  { level: 2, description: 'Semi-skilled', minCredits: 41, maxCredits: 80 },
  { level: 3, description: 'Skilled', minCredits: 81, maxCredits: 120 },
  { level: 4, description: 'Supervisor/Assistant', minCredits: 121, maxCredits: 160 },
  { level: 5, description: 'Technician/Diploma', minCredits: 161, maxCredits: 200 },
  { level: 6, description: 'Graduate', minCredits: 201, maxCredits: 240 },
  { level: 7, description: 'Post-Graduate', minCredits: 241, maxCredits: 280 },
  { level: 8, description: 'Master', minCredits: 281, maxCredits: 320 },
  { level: 9, description: 'Doctoral', minCredits: 321, maxCredits: 360 },
  { level: 10, description: 'Post-Doctoral', minCredits: 361, maxCredits: Infinity },
];

/**
 * Calculate NSQF level based on total accumulated credits
 * @param {number} totalCredits - Total accumulated credits
 * @returns {object} - { level, levelName, description }
 */
export const calculateNSQFLevel = (totalCredits) => {
  if (typeof totalCredits !== 'number' || totalCredits < 0) {
    throw new Error('Invalid total credits value');
  }

  // Find the appropriate level based on total credits
  const nsqfLevel = NSQF_LEVELS.find(
    (level) => totalCredits >= level.minCredits && totalCredits <= level.maxCredits
  );

  if (!nsqfLevel) {
    // Default to level 1 if no match found
    return {
      level: 1,
      levelName: 'Basic/Foundation',
      description: 'Basic/Foundation',
      minCredits: 0,
      maxCredits: 40,
    };
  }

  return {
    level: nsqfLevel.level,
    levelName: nsqfLevel.description,
    description: nsqfLevel.description,
    minCredits: nsqfLevel.minCredits,
    maxCredits: nsqfLevel.maxCredits,
  };
};

/**
 * Validate credit value
 * @param {number} credits - Credits to validate
 * @returns {boolean} - True if valid
 */
export const validateCredits = (credits) => {
  return (
    typeof credits === 'number' &&
    Number.isInteger(credits) &&
    credits >= 1 &&
    credits <= 40
  );
};

/**
 * Get all NSQF levels
 * @returns {array} - Array of NSQF levels
 */
export const getAllNSQFLevels = () => {
  return NSQF_LEVELS.map((level) => ({
    level: level.level,
    description: level.description,
    minCredits: level.minCredits,
    maxCredits: level.maxCredits === Infinity ? 'Unlimited' : level.maxCredits,
  }));
};

/**
 * Get credits needed for next level
 * @param {number} currentCredits - Current total credits
 * @returns {object} - { currentLevel, nextLevel, creditsNeeded }
 */
export const getCreditsForNextLevel = (currentCredits) => {
  const currentLevelInfo = calculateNSQFLevel(currentCredits);
  
  if (currentLevelInfo.level === 10) {
    return {
      currentLevel: currentLevelInfo.level,
      currentLevelName: currentLevelInfo.levelName,
      nextLevel: null,
      creditsNeeded: 0,
      message: 'Maximum level reached',
    };
  }

  const nextLevelInfo = NSQF_LEVELS.find((l) => l.level === currentLevelInfo.level + 1);
  const creditsNeeded = nextLevelInfo.minCredits - currentCredits;

  return {
    currentLevel: currentLevelInfo.level,
    currentLevelName: currentLevelInfo.levelName,
    nextLevel: nextLevelInfo.level,
    nextLevelName: nextLevelInfo.description,
    creditsNeeded: creditsNeeded > 0 ? creditsNeeded : 0,
  };
};

export default {
  calculateNSQFLevel,
  validateCredits,
  getAllNSQFLevels,
  getCreditsForNextLevel,
  NSQF_LEVELS,
};
