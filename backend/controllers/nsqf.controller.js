import NSQFMapping from '../models/NSQFMapping.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Credential from '../models/Credential.model.js';

// NSQF Level definitions
const NSQF_LEVELS = [
  { level: 1, description: 'Basic/Foundation' },
  { level: 2, description: 'Semi-skilled' },
  { level: 3, description: 'Skilled' },
  { level: 4, description: 'Supervisor/Assistant' },
  { level: 5, description: 'Technician/Diploma' },
  { level: 6, description: 'Graduate' },
  { level: 7, description: 'Post-Graduate' },
  { level: 8, description: 'Master' },
  { level: 9, description: 'Doctoral' },
  { level: 10, description: 'Post-Doctoral' },
];

// GET /nsqf/levels
export const getLevels = async (req, res) => {
  res.json(NSQF_LEVELS);
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

