import Issuer from '../models/Issuer.model.js';
import Credential from '../models/Credential.model.js';
import User from '../models/User.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import { generateFileHash } from '../utils/hash.util.js';
import VerificationService from '../services/verification.service.js';

// POST /issuer/register (Admin only)
export const registerIssuer = async (req, res, next) => {
  try {
    const { name, domain, contactEmail } = req.body;

    const issuer = await Issuer.create({
      name,
      allowedDomains: domain ? [domain] : [],
      contactEmail: contactEmail || `contact@${domain}`,
      status: 'approved',
    });

    res.status(201).json({
      issuerId: issuer._id,
      apiKey: issuer.apiKey,
    });
  } catch (error) {
    next(error);
  }
};

// GET /issuer/credentials
export const getIssuerCredentials = async (req, res, next) => {
  try {
    const credentials = await Credential.find({ issuerId: req.issuer._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(credentials);
  } catch (error) {
    next(error);
  }
};

// POST /issuer/credential
export const issueCredential = async (req, res, next) => {
  try {
    const { userEmail, title, skills, nsqfLevel, issueDate, certificateUrl } = req.body;

    // Find or create user
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({
        name: userEmail.split('@')[0],
        email: userEmail,
        passwordHash: Math.random().toString(36),
        role: 'Learner',
      });
      await LearnerProfile.create({ userId: user._id });
    }

    // Generate hash from URL or random
    const certificateHash = certificateUrl
      ? generateFileHash(Buffer.from(certificateUrl))
      : generateFileHash(Buffer.from(`${userEmail}-${title}-${Date.now()}`));

    const credential = await Credential.create({
      userId: user._id,
      issuerId: req.issuer._id,
      title,
      skills: skills || [],
      nsqfLevel: nsqfLevel || 1,
      issueDate: new Date(issueDate),
      certificateUrl: certificateUrl || '',
      certificateHash,
      verificationStatus: 'pending',
    });

    // Update profile
    if (skills && skills.length > 0) {
      await LearnerProfile.findOneAndUpdate(
        { userId: user._id },
        { $addToSet: { skills: { $each: skills } } }
      );
    }

    // Trigger verification
    VerificationService.verifyCredential(credential._id).catch(console.error);

    res.status(201).json({
      credentialId: credential._id,
      status: credential.verificationStatus,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /issuer/credential/:id
export const updateIssuedCredential = async (req, res, next) => {
  try {
    const { revoked, revokeReason } = req.body;
    
    const credential = await Credential.findOne({
      _id: req.params.id,
      issuerId: req.issuer._id,
    });

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    if (revoked !== undefined) credential.revoked = revoked;
    if (revokeReason) credential.revokeReason = revokeReason;

    await credential.save();

    res.json(credential);
  } catch (error) {
    next(error);
  }
};

