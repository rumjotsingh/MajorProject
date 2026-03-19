import NSQFMapping from '../models/NSQFMapping.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import { 
  getAllNSQFLevels, 
  calculateNSQFLevel, 
  getCreditsForNextLevel 
} from '../utils/nsqf.util.js';

// GET /nsqf/levels
export const getLevels = async (req, res) => {
  const levels = getAllNSQFLevels();
  res.json({ levels });
};

// GET /nsqf/my-level - Get current user's NSQF level and progress
export const getMyNSQFLevel = async (req, res, next) => {
  try {
    const learnerProfile = await LearnerProfile.findOne({ userId: req.user.userId });
    
    if (!learnerProfile) {
      return res.status(404).json({ error: 'Learner profile not found' });
    }

    const currentLevelInfo = calculateNSQFLevel(learnerProfile.totalCredits);
    const progressInfo = getCreditsForNextLevel(learnerProfile.totalCredits);

    res.json({
      totalCredits: learnerProfile.totalCredits,
      currentLevel: currentLevelInfo.level,
      levelName: currentLevelInfo.levelName,
      levelDescription: currentLevelInfo.description,
      minCredits: currentLevelInfo.minCredits,
      maxCredits: currentLevelInfo.maxCredits,
      progress: progressInfo,
    });
  } catch (error) {
    next(error);
  }
};

// GET /nsqf/calculate - Calculate NSQF level for given credits (utility endpoint)
export const calculateLevel = async (req, res, next) => {
  try {
    const { credits } = req.query;
    
    if (!credits || isNaN(credits)) {
      return res.status(400).json({ error: 'Valid credits parameter is required' });
    }

    const totalCredits = parseInt(credits);
    const levelInfo = calculateNSQFLevel(totalCredits);
    const progressInfo = getCreditsForNextLevel(totalCredits);

    res.json({
      totalCredits,
      level: levelInfo.level,
      levelName: levelInfo.levelName,
      description: levelInfo.description,
      minCredits: levelInfo.minCredits,
      maxCredits: levelInfo.maxCredits,
      progress: progressInfo,
    });
  } catch (error) {
    next(error);
  }
};

// POST /nsqf/map (Admin only)
export const createMapping = async (req, res, next) => {
  try {
    const { skill, nsqfLevel, stackableNext, recommendedCourses } = req.body;

    const mapping = await NSQFMapping.create({
      skill,
      nsqfLevel,
      stackableNext: stackableNext || [],
      recommendedCourses: recommendedCourses || [],
    });

    res.json(mapping);
  } catch (error) {
    next(error);
  }
};

// GET /nsqf/stack/:userId
export const getCareerPathway = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const currentLevel = profile.nsqfLevel;
    const nextLevel = currentLevel + 1;

    // Find recommended credentials for next level
    const mappings = await NSQFMapping.find({ nsqfLevel: nextLevel }).populate('stackableNext');

    const recommendedCreds = mappings.map((m) => ({
      skill: m.skill,
      level: m.nsqfLevel,
      courses: m.recommendedCourses,
    }));

    res.json({
      currentLevel,
      nextLevel,
      recommendedCreds,
    });
  } catch (error) {
    next(error);
  }
};

