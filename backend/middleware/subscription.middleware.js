import Subscription from '../models/Subscription.model.js';
import Credential from '../models/Credential.model.js';

/**
 * Check if user has an active subscription
 */
export const requireSubscription = (minPlan = 'free') => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({
        userId: req.user.userId,
        status: 'active',
      }).sort({ createdAt: -1 });

      if (!subscription || !subscription.isActive()) {
        return res.status(403).json({
          error: 'Active subscription required',
          message: 'Please upgrade your plan to access this feature',
        });
      }

      // Check plan level
      const planLevels = { free: 0, pro: 1, enterprise: 2 };
      const userLevel = planLevels[subscription.plan];
      const requiredLevel = planLevels[minPlan];

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Upgrade required',
          message: `This feature requires ${minPlan} plan or higher`,
          currentPlan: subscription.plan,
          requiredPlan: minPlan,
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has access to a specific feature
 */
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({
        userId: req.user.userId,
        status: 'active',
      }).sort({ createdAt: -1 });

      if (!subscription || !subscription.isActive()) {
        return res.status(403).json({
          error: 'Active subscription required',
          message: 'Please upgrade your plan to access this feature',
        });
      }

      if (!subscription.hasFeature(featureName)) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `This feature is not available in your current plan. Please upgrade to Pro or Enterprise.`,
          feature: featureName,
          currentPlan: subscription.plan,
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check usage limits (e.g., max credentials)
 */
export const checkLimit = (limitType) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({
        userId: req.user.userId,
        status: 'active',
      }).sort({ createdAt: -1 });

      if (!subscription) {
        return res.status(403).json({
          error: 'No subscription found',
        });
      }

      const limit = subscription.features[limitType];
      
      // -1 means unlimited
      if (limit === -1) {
        req.subscription = subscription;
        return next();
      }

      // Check current usage based on limitType
      if (limitType === 'maxCredentials') {
        const currentCount = await Credential.countDocuments({ userId: req.user.userId });
        
        if (currentCount >= limit) {
          return res.status(403).json({
            error: 'Credential limit reached',
            message: `You have reached your credential limit of ${limit}. Please upgrade your plan to add more credentials.`,
            currentCount,
            limit,
            currentPlan: subscription.plan,
          });
        }
      }

      req.subscription = subscription;
      req.limit = limit;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  requireSubscription,
  requireFeature,
  checkLimit,
};
