import User from '../models/User.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Employer from '../models/Employer.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import logger from '../utils/logger.js';

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create user
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      role: role || 'Learner',
    });

    await user.save();

    // Create profile for learner
    if (user.role === 'Learner') {
      await LearnerProfile.create({ userId: user._id });
    }

    // Generate tokens
    const token = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      userId: user._id,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    logger.info(`User logged in: ${email}`);

    res.json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
};

// POST /auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newToken = generateAccessToken(user._id, user.role);

    res.json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// POST /auth/logout
export const logout = async (req, res) => {
  // With JWT, logout is handled client-side by discarding tokens
  // Optionally implement token blacklist here
  res.status(204).send();
};

// GET /auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

