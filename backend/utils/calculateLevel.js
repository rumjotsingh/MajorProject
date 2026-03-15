import Pathway from "../models/Pathway.model.js";
import LearnerProfile from "../models/LearnerProfile.model.js";
import Enrollment from "../models/Enrollment.model.js";

/**
 * Calculate learner's level based on verified credits and enrolled pathway
 * @param {ObjectId} userId - User ID
 * @param {Number} verifiedCredits - Total verified credits
 * @returns {Number} - Calculated level
 */
export const calculateLevel = async (userId, verifiedCredits) => {
  try {
    // Get learner profile
    const profile = await LearnerProfile.findOne({ userId });
    const activeEnrollment = await Enrollment.findOne({
      learnerId: userId,
      status: "active",
    }).sort("createdAt");

    if (!profile || !activeEnrollment?.pathwayId) {
      // If no pathway enrolled, return level 1
      return 1;
    }

    // Get pathway details
    const pathway = await Pathway.findById(activeEnrollment.pathwayId);

    if (!pathway || !pathway.levels || pathway.levels.length === 0) {
      return 1;
    }

    // Calculate level based on credits using production-level logic
    let calculatedLevel = 1;

    // Sort levels by requiredCredits to ensure correct order
    const sortedLevels = [...pathway.levels].sort(
      (a, b) => a.requiredCredits - b.requiredCredits,
    );

    // Find the highest level where credits meet or exceed requirement
    for (const levelData of sortedLevels) {
      if (verifiedCredits >= levelData.requiredCredits) {
        calculatedLevel = levelData.level;
      } else {
        // Stop when we find a level we haven't reached yet
        break;
      }
    }

    // Cap at level 10
    return Math.min(calculatedLevel, 10);
  } catch (error) {
    console.error("Error calculating level:", error);
    return 1;
  }
};

/**
 * Update learner's level and credits
 * @param {ObjectId} userId - User ID
 */
export const updateLearnerLevel = async (userId) => {
  try {
    const profile = await LearnerProfile.findOne({ userId });

    if (!profile) {
      return;
    }

    // Calculate new level
    const newLevel = await calculateLevel(userId, profile.verifiedCredits);

    // Update if level changed
    if (newLevel !== profile.currentLevel) {
      profile.currentLevel = newLevel;
      await profile.save();

      console.log(`Learner ${userId} upgraded to level ${newLevel}`);
    }
  } catch (error) {
    console.error("Error updating learner level:", error);
  }
};

/**
 * Get progress percentage for current level
 * @param {ObjectId} userId - User ID
 * @returns {Object} - Progress data
 */
export const getLevelProgress = async (userId) => {
  try {
    const profile = await LearnerProfile.findOne({ userId });
    const activeEnrollment = await Enrollment.findOne({
      learnerId: userId,
      status: "active",
    })
      .populate("pathwayId")
      .sort("createdAt");

    if (!profile || !activeEnrollment?.pathwayId) {
      return {
        currentLevel: 1,
        progress: 0,
        creditsForNextLevel: 0,
        currentCredits: 0,
      };
    }

    const pathway = activeEnrollment.pathwayId;
    const currentLevel = profile.currentLevel;
    const verifiedCredits = profile.verifiedCredits;

    // Find current and next level requirements
    const currentLevelData = pathway.levels.find(
      (l) => l.level === currentLevel,
    );
    const nextLevelData = pathway.levels.find(
      (l) => l.level === currentLevel + 1,
    );

    if (!nextLevelData) {
      // Already at max level
      return {
        currentLevel,
        progress: 100,
        creditsForNextLevel: 0,
        currentCredits: verifiedCredits,
        isMaxLevel: true,
      };
    }

    const currentLevelCredits = currentLevelData?.requiredCredits || 0;
    const nextLevelCredits = nextLevelData.requiredCredits;
    const creditsInCurrentLevel = verifiedCredits - currentLevelCredits;
    const creditsNeededForLevel = nextLevelCredits - currentLevelCredits;

    const progress = Math.min(
      Math.round((creditsInCurrentLevel / creditsNeededForLevel) * 100),
      100,
    );

    return {
      currentLevel,
      progress,
      creditsForNextLevel: nextLevelCredits - verifiedCredits,
      currentCredits: verifiedCredits,
      nextLevelCredits,
      isMaxLevel: false,
    };
  } catch (error) {
    console.error("Error getting level progress:", error);
    return {
      currentLevel: 1,
      progress: 0,
      creditsForNextLevel: 0,
      currentCredits: 0,
    };
  }
};

export default {
  calculateLevel,
  updateLearnerLevel,
  getLevelProgress,
};
