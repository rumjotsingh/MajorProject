import Credential from '../models/Credential.model.js';
import User from '../models/User.model.js';
import Issuer from '../models/Issuer.model.js';

// GET /analytics/summary
export const getSummary = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeIssuers = await Issuer.countDocuments({ status: 'approved' });
    const totalCredentials = await Credential.countDocuments();

    res.json({
      totalUsers,
      activeIssuers,
      credentialsPerMonth: [], // Implement aggregation if needed
    });
  } catch (error) {
    next(error);
  }
};

// GET /analytics/skills-trend
export const getSkillsTrend = async (req, res, next) => {
  try {
    const credentials = await Credential.find().select('skills');
    const skillCount = {};

    credentials.forEach((cred) => {
      cred.skills.forEach((skill) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    const skills = Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.json({ skills });
  } catch (error) {
    next(error);
  }
};

// GET /analytics/nsqf-distribution
export const getNSQFDistribution = async (req, res, next) => {
  try {
    const distribution = await Credential.aggregate([
      { $group: { _id: '$nsqfLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ distribution });
  } catch (error) {
    next(error);
  }
};

