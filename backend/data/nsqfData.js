/**
 * NSQF (National Skills Qualification Framework) Pathway Data
 * 
 * This represents the official NSQF framework aligned with Indian education system
 * covering vocational, undergraduate, postgraduate and doctoral stages.
 * 
 * Reference: National Skills Qualification Framework (NSQF)
 * Ministry of Skill Development and Entrepreneurship, Government of India
 */

export const nsqfPathwayData = {
  name: "NSQF Academic Progression Pathway",
  description: "National Skills Qualification Framework aligned progression from Level 1 to Level 10 covering vocational, undergraduate, postgraduate and doctoral stages.",
  category: "Other",
  totalLevels: 10,
  icon: "🎓",
  isOfficial: true,
  levels: [
    {
      level: 1,
      requiredCredits: 10,
      title: "Level 1 – Basic Foundation",
      description: "Entry-level vocational competence with basic literacy, numeracy and simple task execution under supervision.",
      equivalentEducation: "Class 5",
      skillType: "Vocational",
      autonomy: "Under supervision",
      complexity: "Simple, routine tasks"
    },
    {
      level: 2,
      requiredCredits: 20,
      title: "Level 2 – Elementary Skill Worker",
      description: "Basic operational knowledge with limited responsibility and routine task execution.",
      equivalentEducation: "Class 8",
      skillType: "Vocational",
      autonomy: "Limited autonomy",
      complexity: "Routine tasks with some variation"
    },
    {
      level: 3,
      requiredCredits: 30,
      title: "Level 3 – Semi-Skilled Worker",
      description: "Ability to perform skilled tasks with some independence and understanding of processes.",
      equivalentEducation: "Class 10",
      skillType: "Vocational",
      autonomy: "Some independence",
      complexity: "Skilled tasks with understanding"
    },
    {
      level: 4,
      requiredCredits: 40,
      title: "Level 4 – Skilled Technician",
      description: "Technical skills with responsibility for quality and output. Equivalent to Class 12 vocational level.",
      equivalentEducation: "Class 12 / ITI",
      skillType: "Technical",
      autonomy: "Responsible for quality",
      complexity: "Technical skills with responsibility"
    },
    {
      level: 5,
      requiredCredits: 60,
      title: "Level 5 – Diploma / Advanced Technician",
      description: "Comprehensive technical knowledge. Equivalent to first year of undergraduate or diploma certification.",
      equivalentEducation: "Diploma / 1st Year UG",
      skillType: "Technical/Professional",
      autonomy: "Significant autonomy",
      complexity: "Comprehensive technical knowledge"
    },
    {
      level: 6,
      requiredCredits: 80,
      title: "Level 6 – Graduate Level",
      description: "Bachelor degree level competence with analytical thinking, problem-solving and professional responsibility.",
      equivalentEducation: "Bachelor's Degree",
      skillType: "Professional",
      autonomy: "Professional autonomy",
      complexity: "Analytical and problem-solving"
    },
    {
      level: 7,
      requiredCredits: 100,
      title: "Level 7 – Postgraduate Level",
      description: "Advanced theoretical and practical knowledge equivalent to Master's degree level.",
      equivalentEducation: "Master's Degree",
      skillType: "Advanced Professional",
      autonomy: "High autonomy",
      complexity: "Advanced theoretical knowledge"
    },
    {
      level: 8,
      requiredCredits: 120,
      title: "Level 8 – Research / MPhil Level",
      description: "Specialized knowledge involving research capability and independent project leadership.",
      equivalentEducation: "MPhil / PG Diploma",
      skillType: "Research",
      autonomy: "Independent research",
      complexity: "Specialized research capability"
    },
    {
      level: 9,
      requiredCredits: 140,
      title: "Level 9 – Doctoral Level",
      description: "Highly advanced research capability contributing to original knowledge creation.",
      equivalentEducation: "PhD / Doctorate",
      skillType: "Advanced Research",
      autonomy: "Full autonomy",
      complexity: "Original knowledge creation"
    },
    {
      level: 10,
      requiredCredits: 160,
      title: "Level 10 – Post Doctoral / Expert Level",
      description: "National or international level expertise with innovation, policy influence and leadership in domain.",
      equivalentEducation: "Post-Doctoral / Expert",
      skillType: "Expert/Leadership",
      autonomy: "Strategic leadership",
      complexity: "Innovation and policy influence"
    }
  ]
};

/**
 * Helper function to get current level based on credits
 * Production-level implementation
 */
export const getCurrentLevel = (credits, levels) => {
  let currentLevel = 1;
  
  // Sort levels by requiredCredits to ensure correct order
  const sortedLevels = [...levels].sort((a, b) => a.requiredCredits - b.requiredCredits);
  
  // Find the highest level where credits meet or exceed requirement
  for (const lvl of sortedLevels) {
    if (credits >= lvl.requiredCredits) {
      currentLevel = lvl.level;
    } else {
      break;
    }
  }
  
  return currentLevel;
};

/**
 * Get level details by level number
 */
export const getLevelDetails = (levelNumber) => {
  return nsqfPathwayData.levels.find(l => l.level === levelNumber);
};

/**
 * Get credits required for next level
 */
export const getCreditsForNextLevel = (currentCredits, levels) => {
  const currentLevel = getCurrentLevel(currentCredits, levels);
  const nextLevel = levels.find(l => l.level === currentLevel + 1);
  
  if (!nextLevel) {
    return 0; // Already at max level
  }
  
  return nextLevel.requiredCredits - currentCredits;
};

/**
 * Calculate progress percentage for current level
 */
export const getLevelProgressPercentage = (currentCredits, levels) => {
  const currentLevel = getCurrentLevel(currentCredits, levels);
  const currentLevelData = levels.find(l => l.level === currentLevel);
  const nextLevelData = levels.find(l => l.level === currentLevel + 1);
  
  if (!nextLevelData) {
    return 100; // Max level reached
  }
  
  const currentLevelCredits = currentLevelData?.requiredCredits || 0;
  const nextLevelCredits = nextLevelData.requiredCredits;
  const creditsInCurrentLevel = currentCredits - currentLevelCredits;
  const creditsNeededForLevel = nextLevelCredits - currentLevelCredits;
  
  return Math.min(
    Math.round((creditsInCurrentLevel / creditsNeededForLevel) * 100),
    100
  );
};

export default nsqfPathwayData;
