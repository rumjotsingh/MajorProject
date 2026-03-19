import Employer from '../models/Employer.model.js';
import User from '../models/User.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Credential from '../models/Credential.model.js';
import Notification from '../models/Notification.model.js';
import { validateObjectId } from '../utils/validation.util.js';
import VerificationService from '../services/verification.service.js';

// POST /employer/register
export const registerEmployer = async (req, res, next) => {
  try {
    const { companyName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      name: companyName,
      email,
      passwordHash: password,
      role: 'Employer',
    });

    await Employer.create({
      userId: user._id,
      companyName,
      contactEmail: email,
      verified: false,
    });

    res.status(201).json({
      userId: user._id,
      verified: false,
    });
  } catch (error) {
    next(error);
  }
};

// GET /employer/search
export const searchLearners = async (req, res, next) => {
  try {
    const { skill, nsqf, keyword } = req.query;
    const query = {};

    if (skill) query.skills = { $in: [skill] };
    if (nsqf) query.nsqfLevel = { $gte: parseInt(nsqf) };

    let profiles = await LearnerProfile.find(query)
      .populate('userId', 'name email')
      .select('skills nsqfLevel bio')
      .limit(50);

    if (keyword) {
      profiles = profiles.filter((p) =>
        p.userId.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    res.json(profiles);
  } catch (error) {
    next(error);
  }
};

// GET /employer/profile/:learnerId
export const getLearnerProfile = async (req, res, next) => {
  try {
    validateObjectId(req.params.learnerId, 'Learner ID');
    
    const profile = await LearnerProfile.findOne({ userId: req.params.learnerId }).populate(
      'userId',
      'name email'
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const credentials = await Credential.find({ userId: req.params.learnerId })
      .select('title verificationStatus issueDate')
      .populate('issuerId', 'name');

    res.json({
      ...profile.toObject(),
      credentials,
    });
  } catch (error) {
    next(error);
  }
};

// POST /employer/verify
export const verifyCredential = async (req, res, next) => {
  try {
    const { credentialId } = req.body;

    validateObjectId(credentialId, 'Credential ID');

    const credential = await Credential.findById(credentialId);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const result = await VerificationService.verifyCredential(credentialId);

    res.json({
      valid: result.status === 'success',
      message: result.resultDetails,
      source: result.method,
    });
  } catch (error) {
    next(error);
  }
};

// POST /employer/contact
export const contactLearner = async (req, res, next) => {
  try {
    const { learnerId, message } = req.body;

    await Notification.create({
      userId: learnerId,
      type: 'EmployerContact',
      message: `${req.user.name} is interested: ${message}`,
      metadata: { employerId: req.user.userId },
    });

    res.status(202).json({ message: 'Notification sent' });
  } catch (error) {
    next(error);
  }
};

