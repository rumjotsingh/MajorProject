import { verifyAccessToken } from '../utils/jwt.util.js';
import { isValidObjectId } from '../utils/validation.util.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    // Validate userId is a valid ObjectId
    if (!decoded.userId || !isValidObjectId(decoded.userId)) {
      logger.warn('Invalid userId in token:', { userId: decoded.userId });
      return res.status(401).json({ error: 'Invalid token: malformed user ID' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Ensure userId is converted to string for consistency
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Issuer API key authentication
export const authenticateIssuer = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const Issuer = await import('../models/Issuer.model.js');
    const issuer = await Issuer.default.findOne({ apiKey, status: 'approved' });

    if (!issuer) {
      return res.status(401).json({ error: 'Invalid API key or issuer not approved' });
    }

    req.issuer = issuer;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};
