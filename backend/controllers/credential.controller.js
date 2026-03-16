import Credential from '../models/Credential.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Issuer from '../models/Issuer.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.util.js';
import { generateFileHash } from '../utils/hash.util.js';
import VerificationService from '../services/verification.service.js';

// POST /credentials/upload
export const uploadCredential = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const metadata = JSON.parse(req.body.metadata || '{}');
    const { title, issuer, issueDate, skills, nsqfLevel } = metadata;

    if (!title || !issuer || !issueDate) {
      return res.status(400).json({ error: 'Title, issuer, and issueDate are required' });
    }

    // Find or create issuer
    let issuerDoc = await Issuer.findOne({ name: issuer });
    if (!issuerDoc) {
      issuerDoc = await Issuer.create({
        name: issuer,
        status: 'approved',
        contactEmail: 'unknown@example.com',
      });
    }

    // Generate hash
    const certificateHash = generateFileHash(req.file.buffer);

    // Check for duplicate
    const existing = await Credential.findOne({ certificateHash });
    if (existing) {
      return res.status(409).json({ error: 'Credential already exists' });
    }

    // Upload to Cloudinary
    const certificateUrl = await uploadToCloudinary(
      req.file.buffer,
      req.user.userId,
      req.file.originalname
    );

    // Create credential
    const credential = await Credential.create({
      userId: req.user.userId,
      issuerId: issuerDoc._id,
      title,
      skills: skills || [],
      nsqfLevel: nsqfLevel || 1,
      issueDate: new Date(issueDate),
      certificateUrl,
      certificateHash,
      verificationStatus: 'pending',
    });

    // Update learner profile skills
    if (skills && skills.length > 0) {
      await LearnerProfile.findOneAndUpdate(
        { userId: req.user.userId },
        { $addToSet: { skills: { $each: skills } } }
      );
    }

    // Trigger verification asynchronously
    VerificationService.verifyCredential(credential._id).catch(console.error);

    res.status(201).json({
      credentialId: credential._id,
      verificationStatus: credential.verificationStatus,
    });
  } catch (error) {
    next(error);
  }
};

// GET /credentials
export const getMyCredentials = async (req, res, next) => {
  try {
    const credentials = await Credential.find({ userId: req.user.userId })
      .populate('issuerId', 'name')
      .sort({ createdAt: -1 });

    res.json(credentials);
  } catch (error) {
    next(error);
  }
};

// GET /credentials/:id
export const getCredentialById = async (req, res, next) => {
  try {
    const credential = await Credential.findById(req.params.id).populate('issuerId', 'name');

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Check access
    if (
      credential.userId.toString() !== req.user.userId.toString() &&
      !['Admin', 'Employer'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(credential);
  } catch (error) {
    next(error);
  }
};

// PUT /credentials/:id
export const updateCredential = async (req, res, next) => {
  try {
    const { skills, title, nsqfLevel } = req.body;
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Check permissions
    const isOwner = credential.userId.toString() === req.user.userId.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (skills) credential.skills = skills;
    if (title) credential.title = title;
    if (nsqfLevel) credential.nsqfLevel = nsqfLevel;

    await credential.save();

    res.json(credential);
  } catch (error) {
    next(error);
  }
};

// DELETE /credentials/:id
export const deleteCredential = async (req, res, next) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Check permissions
    const isOwner = credential.userId.toString() === req.user.userId.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Credential.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// GET /credentials/:id/download
export const downloadCredential = async (req, res, next) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Check permissions
    const isOwner = credential.userId.toString() === req.user.userId.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Redirect to Cloudinary URL
    res.redirect(credential.certificateUrl);
  } catch (error) {
    next(error);
  }
};

// POST /credentials/:id/verify
export const triggerVerification = async (req, res, next) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Trigger verification
    VerificationService.verifyCredential(credential._id).catch(console.error);

    res.status(202).json({ message: 'Verification queued' });
  } catch (error) {
    next(error);
  }
};

