import logger from '../utils/logger.js';
import Credential from '../models/Credential.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Issuer from '../models/Issuer.model.js';
import User from '../models/User.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.util.js';
import { generateFileHash } from '../utils/hash.util.js';
import { validateObjectId, isValidObjectId } from '../utils/validation.util.js';
import VerificationService from '../services/verification.service.js';
import { sendNotification } from '../utils/notification.util.js';
import { calculateNSQFLevel, validateCredits } from '../utils/nsqf.util.js';

// POST /credentials/upload-file (Upload file to Cloudinary only)
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Upload to Cloudinary
    const certificateUrl = await uploadToCloudinary(
      req.file.buffer,
      req.user.userId,
      req.file.originalname
    );

    res.json({
      certificateUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// POST /credentials/upload
export const uploadCredential = async (req, res, next) => {
  try {
    // Validate authentication - should be set by authenticate middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.userId) {
      return res.status(401).json({ error: 'User ID not found in session' });
    }

    // Validate userId is a valid ObjectId
    if (!isValidObjectId(req.user.userId)) {
      return res.status(400).json({ error: 'Invalid user session: malformed user ID' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Parse and validate metadata
    let metadata;
    try {
      metadata = JSON.parse(req.body.metadata || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid metadata format' });
    }

    const { title, issuer, issueDate, skills, credits } = metadata;

    // Validate required fields are not empty
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    if (!issuer || typeof issuer !== 'string' || !issuer.trim()) {
      return res.status(400).json({ error: 'Issuer is required and must be a non-empty string' });
    }
    if (!issueDate) {
      return res.status(400).json({ error: 'Issue date is required' });
    }

    // Validate credits (mandatory field, range 1-40)
    if (!credits) {
      return res.status(400).json({ error: 'Credits field is required' });
    }

    if (!validateCredits(credits)) {
      return res.status(400).json({ 
        error: 'Invalid credits value. Must be an integer between 1 and 40' 
      });
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

    // Validate issuer was created/found successfully
    if (!issuerDoc || !issuerDoc._id) {
      return res.status(500).json({ error: 'Failed to process issuer' });
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

    // Get current learner profile
    let learnerProfile = await LearnerProfile.findOne({ userId: req.user.userId });
    if (!learnerProfile) {
      learnerProfile = await LearnerProfile.create({ userId: req.user.userId });
    }

    // DO NOT update credits/NSQF level yet - wait for verification
    // Just calculate what the NSQF level would be for display purposes
    const potentialTotalCredits = (learnerProfile.totalCredits || 0) + credits;
    const potentialNsqfInfo = calculateNSQFLevel(potentialTotalCredits);

    // Create credential with calculated NSQF level (for reference, but not counted yet)
    const credential = await Credential.create({
      userId: req.user.userId,
      issuerId: issuerDoc._id,
      title,
      skills: skills || [],
      credits,
      nsqfLevel: potentialNsqfInfo.level, // Stored for reference
      issueDate: new Date(issueDate),
      certificateUrl,
      certificateHash,
      verificationStatus: 'pending',
    });

    // DO NOT update learner profile credits/level until verification
    // Only update skills if provided
    if (skills && skills.length > 0) {
      const updatedSkills = [...new Set([...learnerProfile.skills, ...skills])];
      learnerProfile.skills = updatedSkills;
      try {
        await learnerProfile.save();
      } catch (profileError) {
        logger.error('Failed to update learner profile skills:', profileError);
      }
    }

    // Send notification to learner
    try {
      await sendNotification(
        req.app,
        req.user.userId,
        'CredentialAdded',
        `Your credential "${title}" has been uploaded and is pending verification.`,
        { credentialId: credential._id }
      );
    } catch (notificationError) {
      // If notification fails, log it but don't fail the whole upload
      logger.error('Failed to send notification:', notificationError);
    }

    // Send notification to issuer about new credential upload
    try {
      // Find issuer users (users with Issuer role and matching email domain or all issuers)
      const issuerUsers = await Issuer.findById(issuerDoc._id);
      if (issuerUsers && issuerUsers.contactEmail) {
        // Find user account for this issuer
        const issuerUser = await User.findOne({ 
          email: issuerUsers.contactEmail,
          role: 'Issuer'
        });
        
        if (issuerUser) {
          await sendNotification(
            req.app,
            issuerUser._id,
            'System',
            `New credential "${title}" uploaded by learner and requires verification`,
            { credentialId: credential._id, learnerId: req.user.userId }
          );
        }
      }
    } catch (issuerNotificationError) {
      // If issuer notification fails, log it but don't fail the upload
      logger.error('Failed to send issuer notification:', issuerNotificationError);
    }
    

    // Return info - credits will be added after verification
    res.status(201).json({
      credentialId: credential._id,
      verificationStatus: credential.verificationStatus,
      creditsToBeEarned: credits,
      currentTotalCredits: learnerProfile.totalCredits,
      currentNsqfLevel: learnerProfile.nsqfLevel,
      potentialNsqfLevel: potentialNsqfInfo.level,
      message: `Credential uploaded successfully! After verification, you will earn ${credits} credits and reach NSQF Level ${potentialNsqfInfo.level} (${potentialNsqfInfo.levelName})`,
    });
  } catch (error) {
    next(error);
  }
};

// GET /credentials
export const getMyCredentials = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status; // verified, pending, failed

    // Build query
    const query = { userId: req.user.userId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      query.verificationStatus = status;
    }

    const total = await Credential.countDocuments(query);
    const credentials = await Credential.find(query)
      .populate('issuerId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      credentials,
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

// GET /credentials/:id
export const getCredentialById = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'Credential ID');
    
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
    validateObjectId(req.params.id, 'Credential ID');
    
    const { skills, title, credits, certificateUrl, issueDate } = req.body;
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

    // Only allow editing if credential is not verified
    if (credential.verificationStatus === 'verified' && !isAdmin) {
      return res.status(400).json({ error: 'Cannot edit verified credentials' });
    }

    // Store old credits for recalculation
    const oldCredits = credential.credits;

    // Update allowed fields
    if (skills) credential.skills = skills;
    if (title) credential.title = title;
    if (certificateUrl) credential.certificateUrl = certificateUrl;
    if (issueDate) credential.issueDate = new Date(issueDate);
    
    // Validate and update credits if changed
    if (credits !== undefined && credits !== oldCredits) {
      if (!validateCredits(credits)) {
        return res.status(400).json({ 
          error: 'Invalid credits value. Must be an integer between 1 and 40' 
        });
      }
      
      // Recalculate total credits and NSQF level
      const learnerProfile = await LearnerProfile.findOne({ userId: credential.userId });
      if (learnerProfile) {
        const creditDifference = credits - oldCredits;
        const newTotalCredits = learnerProfile.totalCredits + creditDifference;
        
        // Recalculate NSQF level
        const nsqfInfo = calculateNSQFLevel(newTotalCredits);
        
        // Update learner profile
        learnerProfile.totalCredits = newTotalCredits;
        learnerProfile.nsqfLevel = nsqfInfo.level;
        learnerProfile.levelName = nsqfInfo.levelName;
        await learnerProfile.save();
        
        // Update credential NSQF level (backend-controlled)
        credential.nsqfLevel = nsqfInfo.level;
      }
      
      credential.credits = credits;
    }

    // IMPORTANT: nsqfLevel is NEVER taken from user input - always calculated
    // Remove any nsqfLevel from request body to prevent manipulation

    await credential.save();

    // Populate issuer before returning
    await credential.populate('issuerId', 'name');

    res.json(credential);
  } catch (error) {
    next(error);
  }
};

// DELETE /credentials/:id
export const deleteCredential = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'Credential ID');
    
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

    // Recalculate total credits after deletion
    const learnerProfile = await LearnerProfile.findOne({ userId: credential.userId });
    if (learnerProfile && credential.credits) {
      const newTotalCredits = Math.max(0, learnerProfile.totalCredits - credential.credits);
      
      // Recalculate NSQF level
      const nsqfInfo = calculateNSQFLevel(newTotalCredits);
      
      // Update learner profile
      learnerProfile.totalCredits = newTotalCredits;
      learnerProfile.nsqfLevel = nsqfInfo.level;
      learnerProfile.levelName = nsqfInfo.levelName;
      await learnerProfile.save();
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
    validateObjectId(req.params.id, 'Credential ID');
    
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
    validateObjectId(req.params.id, 'Credential ID');
    
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

