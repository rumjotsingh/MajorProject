import User from '../models/User.model.js';
import Credential from '../models/Credential.model.js';
import Issuer from '../models/Issuer.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';

// GET /admin/stats
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLearners = await User.countDocuments({ role: 'Learner' });
    const totalCredentials = await Credential.countDocuments();
    const activeIssuers = await Issuer.countDocuments({ status: 'approved' });

    res.json({
      totalUsers,
      totalLearners,
      totalCredentials,
      activeIssuers,
    });
  } catch (error) {
    next(error);
  }
};

// POST /admin/approve-issuer
export const approveIssuer = async (req, res, next) => {
  try {
    const { issuerId } = req.body;

    const issuer = await Issuer.findByIdAndUpdate(
      issuerId,
      { status: 'approved' },
      { new: true }
    );

    if (!issuer) {
      return res.status(404).json({ error: 'Issuer not found' });
    }

    res.json({ message: 'Issuer approved', issuer });
  } catch (error) {
    next(error);
  }
};

