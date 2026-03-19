import CareerPath from '../models/CareerPath.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Credential from '../models/Credential.model.js';
import { validateObjectId } from '../utils/validation.util.js';

// GET /career-paths/suggestions
export const getCareerSuggestions = async (req, res, next) => {
  try {
    // Get learner profile and credentials
    const profile = await LearnerProfile.findOne({ userId: req.user.userId });
    const credentials = await Credential.find({ 
      userId: req.user.userId,
      verificationStatus: 'verified'
    });

    if (!profile) {
      return res.json([]);
    }

    // Get user's skills and NSQF level
    const userSkills = profile.skills || [];
    const userNsqfLevel = profile.nsqfLevel || 1;

    // Find matching career paths
    const careerPaths = await CareerPath.find({
      $or: [
        { requiredSkills: { $in: userSkills } },
        { 
          'nsqfLevelRange.min': { $lte: userNsqfLevel + 2 },
          'nsqfLevelRange.max': { $gte: userNsqfLevel }
        }
      ]
    }).limit(10);

    // Calculate match percentage for each career path
    const suggestions = careerPaths.map(path => {
      const matchingSkills = path.requiredSkills.filter(skill => 
        userSkills.includes(skill)
      );
      const matchPercentage = path.requiredSkills.length > 0
        ? Math.round((matchingSkills.length / path.requiredSkills.length) * 100)
        : 0;

      const missingSkills = path.requiredSkills.filter(skill => 
        !userSkills.includes(skill)
      );

      return {
        ...path.toObject(),
        matchPercentage,
        matchingSkills,
        missingSkills,
      };
    });

    // Sort by match percentage
    suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
};

// GET /career-paths
export const getAllCareerPaths = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const industry = req.query.industry;
    const experienceLevel = req.query.experienceLevel;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (industry) {
      query.industry = industry;
    }
    
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    const total = await CareerPath.countDocuments(query);
    const careerPaths = await CareerPath.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      careerPaths,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /career-paths/:id
export const getCareerPathById = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'Career Path ID');
    
    const careerPath = await CareerPath.findById(req.params.id);

    if (!careerPath) {
      return res.status(404).json({ error: 'Career path not found' });
    }

    res.json(careerPath);
  } catch (error) {
    next(error);
  }
};

// POST /career-paths (Admin only)
export const createCareerPath = async (req, res, next) => {
  try {
    const careerPath = await CareerPath.create(req.body);
    res.status(201).json(careerPath);
  } catch (error) {
    next(error);
  }
};

// PUT /career-paths/:id (Admin only)
export const updateCareerPath = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'Career Path ID');
    
    const careerPath = await CareerPath.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!careerPath) {
      return res.status(404).json({ error: 'Career path not found' });
    }

    res.json(careerPath);
  } catch (error) {
    next(error);
  }
};

// DELETE /career-paths/:id (Admin only)
export const deleteCareerPath = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'Career Path ID');
    
    const careerPath = await CareerPath.findByIdAndDelete(req.params.id);

    if (!careerPath) {
      return res.status(404).json({ error: 'Career path not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
