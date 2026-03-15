import { verifyAccessToken } from "../utils/jwt.util.js";
import { findUserByIdAcrossRoles } from "../utils/userModel.util.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const decoded = verifyAccessToken(token);
    const user = await findUserByIdAcrossRoles(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Account is suspended",
      });
    }

    if (user.isLocked()) {
      return res.status(403).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed login attempts",
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid token",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

const requireApproval = (req, res, next) => {
  if (!req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: "Account pending approval",
    });
  }
  next();
};

export { authenticate, authorize, requireApproval };
