import LearnerProfile from '../models/LearnerProfile.model.js';
import Credential from '../models/Credential.model.js';
import User from '../models/User.model.js';

// GET /profile/me
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await LearnerProfile.findOne({ userId: req.user.userId }).populate(
      'userId',
      'name email'
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// PUT /profile/me
export const updateMyProfile = async (req, res, next) => {
  try {
    const { bio, skills, education, experience, preferences } = req.body;

    const profile = await LearnerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { bio, skills, education, experience, preferences },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// GET /profiles - Search profiles (for employers)
export const searchProfiles = async (req, res, next) => {
  try {
    const { skill, minNSQF, keyword } = req.query;
    const query = {};

    if (skill) {
      query.skills = { $in: [skill] };
    }

    if (minNSQF) {
      query.nsqfLevel = { $gte: parseInt(minNSQF) };
    }

    const profiles = await LearnerProfile.find(query)
      .populate('userId', 'name email')
      .select('skills nsqfLevel bio')
      .limit(50);

    // Filter by keyword if provided
    let results = profiles;
    if (keyword) {
      results = profiles.filter((p) =>
        p.userId.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// GET /profiles/:id/credentials
export const getProfileCredentials = async (req, res, next) => {
  try {
    const { id } = req.params;

    const credentials = await Credential.find({ userId: id })
      .select('title issueDate verificationStatus nsqfLevel')
      .populate('issuerId', 'name');

    res.json(credentials);
  } catch (error) {
    next(error);
  }
};

// GET /profiles/:id/skills
export const getProfileSkills = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await LearnerProfile.findOne({ userId: id }).select('skills');

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ skills: profile.skills });
  } catch (error) {
    next(error);
  }
};

