import Issuer from '../models/Issuer.model.js';
import Credential from '../models/Credential.model.js';
import User from '../models/User.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import { generateFileHash } from '../utils/hash.util.js';
import { validateObjectId } from '../utils/validation.util.js';
import VerificationService from '../services/verification.service.js';
import { sendNotification } from '../utils/notification.util.js';
import { calculateNSQFLevel, validateCredits } from '../utils/nsqf.util.js';
import logger from '../utils/logger.js';

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

// GET /issuer/credentials or /issuer/dashboard/credentials - With pagination, search, and filters
export const getIssuerCredentials = async (req, res, next) => {
  try {
    let issuerId;
    
    // Check if authenticated via API key (req.issuer) or JWT token (req.user)
    if (req.issuer) {
      issuerId = req.issuer._id;
    } else if (req.user && req.user.role === 'Issuer') {
      // Find issuer by user email or create one if doesn't exist
      const issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        // Create issuer for this user
        const newIssuer = await Issuer.create({
          name: req.user.name || req.user.email.split('@')[0],
          contactEmail: req.user.email,
          status: 'approved',
        });
        issuerId = newIssuer._id;
      } else {
        issuerId = issuer._id;
      }
    } else {
      return res.status(403).json({ error: 'Not authorized as issuer' });
    }

    // Check if this is a dashboard request (no pagination needed)
    const isDashboard = req.path.includes('/dashboard/');
    
    if (isDashboard) {
      // Return simple array for dashboard
      const credentials = await Credential.find({ issuerId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
      
      return res.json(credentials);
    }

    // Parse query parameters for paginated requests
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || ''; // verified, pending, rejected
    const nsqfLevel = req.query.nsqfLevel || '';
    const sortBy = req.query.sortBy || 'createdAt'; // createdAt, issueDate, title, nsqfLevel
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { issuerId };
    
    // Apply status filter
    if (status) {
      query.verificationStatus = status;
    }
    
    // Apply NSQF level filter
    if (nsqfLevel) {
      query.nsqfLevel = parseInt(nsqfLevel);
    }

    // Get total count for pagination
    const total = await Credential.countDocuments(query);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Fetch credentials with pagination
    let credentials = await Credential.find(query)
      .populate('userId', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    // Apply search filter (post-query for populated fields)
    if (search) {
      const searchLower = search.toLowerCase();
      credentials = credentials.filter(cred => 
        cred.title.toLowerCase().includes(searchLower) ||
        (cred.userId && cred.userId.name.toLowerCase().includes(searchLower)) ||
        (cred.userId && cred.userId.email.toLowerCase().includes(searchLower)) ||
        cred.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);

    res.json({
      credentials,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /issuer/credential or /issuer/issue-credential
export const issueCredential = async (req, res, next) => {
  try {
    let issuerId;
    
    // Handle both API key auth (req.issuer) and JWT auth (req.user)
    if (req.issuer && req.issuer._id) {
      // API key authentication
      issuerId = req.issuer._id;
      validateObjectId(issuerId, 'Issuer ID');
    } else if (req.user && req.user.role === 'Issuer') {
      // JWT authentication - find issuer by user email
      const issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        return res.status(404).json({ error: 'Issuer profile not found' });
      }
      issuerId = issuer._id;
    } else {
      return res.status(401).json({ error: 'Issuer authentication required' });
    }

    const { userEmail, title, skills, credits, issueDate, certificateUrl } = req.body;

    // Validate required fields
    if (!userEmail || !title || !issueDate) {
      return res.status(400).json({ error: 'User email, title, and issue date are required' });
    }

    // Validate credits
    if (!credits) {
      return res.status(400).json({ error: 'Credits field is required' });
    }

    if (!validateCredits(credits)) {
      return res.status(400).json({ 
        error: 'Invalid credits value. Must be an integer between 1 and 40' 
      });
    }

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

    // Validate user was found/created with valid ID
    if (!user || !user._id) {
      return res.status(500).json({ error: 'Failed to process user' });
    }

    validateObjectId(user._id, 'User ID');

    // Get or create learner profile
    let learnerProfile = await LearnerProfile.findOne({ userId: user._id });
    if (!learnerProfile) {
      learnerProfile = await LearnerProfile.create({ userId: user._id });
    }

    // Check learner's subscription limits
    const Subscription = (await import('../models/Subscription.model.js')).default;
    let subscription = await Subscription.findOne({
      userId: user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    // If no subscription, create free plan
    if (!subscription) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 365);
      subscription = await Subscription.create({
        userId: user._id,
        plan: 'free',
        status: 'active',
        amount: 0,
        endDate,
        features: {
          maxCredentials: 10,
          maxSkills: 20,
          aiRecommendations: false,
          prioritySupport: false,
          customBranding: false,
          apiAccess: false,
          analytics: false,
        },
      });
    }

    // Check credential limit
    const credentialCount = await Credential.countDocuments({ userId: user._id });
    const maxCredentials = subscription.features.maxCredentials;
    
    if (maxCredentials !== -1 && credentialCount >= maxCredentials) {
      return res.status(403).json({ 
        error: 'Credential limit reached',
        message: `Learner has reached their credential limit (${maxCredentials}). They need to upgrade their subscription.`,
        currentCount: credentialCount,
        maxAllowed: maxCredentials,
        plan: subscription.plan,
      });
    }

    // Calculate new total credits (will be added after verification)
    const newTotalCredits = (learnerProfile.totalCredits || 0) + credits;

    // Calculate NSQF level based on total credits (backend-controlled)
    const nsqfInfo = calculateNSQFLevel(newTotalCredits);

    // Generate hash from URL or random - add timestamp to make it unique
    const certificateHash = certificateUrl
      ? generateFileHash(Buffer.from(`${certificateUrl}-${Date.now()}`))
      : generateFileHash(Buffer.from(`${userEmail}-${title}-${Date.now()}`));

    // Check for duplicate credential (same user, issuer, title, and date)
    const existingCredential = await Credential.findOne({
      userId: user._id,
      issuerId: issuerId,
      title,
      issueDate: new Date(issueDate),
    });

    if (existingCredential) {
      return res.status(409).json({ 
        error: 'Duplicate credential',
        message: 'A credential with the same title and issue date already exists for this learner',
      });
    }

    const credential = await Credential.create({
      userId: user._id,
      issuerId: issuerId,
      title,
      skills: skills || [],
      credits,
      nsqfLevel: nsqfInfo.level, // Automatically calculated
      issueDate: new Date(issueDate),
      certificateUrl: certificateUrl || '',
      certificateHash,
      verificationStatus: 'verified', // Auto-verify credentials issued by issuers
    });

    // Update learner profile with new credits and NSQF level
    const updatedSkills = skills && skills.length > 0 
      ? [...new Set([...learnerProfile.skills, ...skills])]
      : learnerProfile.skills;

    learnerProfile.totalCredits = newTotalCredits;
    learnerProfile.nsqfLevel = nsqfInfo.level;
    learnerProfile.levelName = nsqfInfo.levelName;
    learnerProfile.skills = updatedSkills;
    await learnerProfile.save();

    // No need to trigger verification - credentials issued by issuers are auto-verified
    // VerificationService.verifyCredential(credential._id).catch(console.error);

    // Send notification to learner about new credential
    try {
      await sendNotification(
        req.app,
        user._id,
        'CredentialVerified', // Use verified type since it's auto-verified
        `You have been issued a verified credential: "${title}". You earned ${credits} credits!`,
        { credentialId: credential._id }
      );
    } catch (notificationError) {
      logger.error('Failed to send learner notification:', notificationError);
    }

    // Send notification to issuer about successful issuance
    try {
      // Find issuer user account
      const issuer = await Issuer.findById(issuerId);
      if (issuer) {
        const issuerUser = await User.findOne({ 
          email: issuer.contactEmail,
          role: 'Issuer'
        });
        
        if (issuerUser) {
          await sendNotification(
            req.app,
            issuerUser._id,
            'System',
            `Successfully issued credential "${title}" to ${userEmail}`,
            { credentialId: credential._id, learnerId: user._id }
          );
        }
      }
    } catch (issuerNotificationError) {
      logger.error('Failed to send issuer notification:', issuerNotificationError);
    }

    res.status(201).json({
      credentialId: credential._id,
      status: 'verified', // Auto-verified
      creditsEarned: credits,
      totalCredits: newTotalCredits,
      nsqfLevel: nsqfInfo.level,
      levelName: nsqfInfo.levelName,
      message: `Credential issued and verified successfully! Learner earned ${credits} credits and is now at NSQF Level ${nsqfInfo.level} (${nsqfInfo.levelName})`,
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

// GET /issuer/profile
export const getIssuerProfile = async (req, res, next) => {
  try {
    let issuer;
    
    if (req.issuer) {
      issuer = req.issuer;
    } else if (req.user && req.user.role === 'Issuer') {
      issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        issuer = await Issuer.create({
          name: req.user.name || req.user.email.split('@')[0],
          contactEmail: req.user.email,
          status: 'approved',
        });
      }
    } else {
      return res.status(403).json({ error: 'Not authorized as issuer' });
    }

    res.json(issuer);
  } catch (error) {
    next(error);
  }
};

// PUT /issuer/profile
export const updateIssuerProfile = async (req, res, next) => {
  try {
    const { name, contactEmail, allowedDomains } = req.body;
    
    let issuer;
    
    if (req.issuer) {
      issuer = req.issuer;
    } else if (req.user && req.user.role === 'Issuer') {
      issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        return res.status(404).json({ error: 'Issuer profile not found' });
      }
    } else {
      return res.status(403).json({ error: 'Not authorized as issuer' });
    }

    if (name) issuer.name = name;
    if (contactEmail) issuer.contactEmail = contactEmail;
    if (allowedDomains) issuer.allowedDomains = allowedDomains;

    await issuer.save();

    res.json(issuer);
  } catch (error) {
    next(error);
  }
};

// GET /issuer/learners - Get all learners with pagination, search, and filters
export const getIssuerLearners = async (req, res, next) => {
  try {
    let issuerId;
    
    if (req.issuer) {
      issuerId = req.issuer._id;
    } else if (req.user && req.user.role === 'Issuer') {
      const issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        return res.json({
          learners: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        });
      }
      issuerId = issuer._id;
    } else {
      return res.status(403).json({ error: 'Not authorized as issuer' });
    }

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || ''; // verified, pending, rejected
    const sortBy = req.query.sortBy || 'latestCredential'; // name, email, credentialsCount, verifiedCount, latestCredential
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Get unique learners from credentials
    const credentials = await Credential.find({ issuerId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Group by learner
    const learnersMap = new Map();
    credentials.forEach(cred => {
      if (!cred.userId) return;
      
      const userId = cred.userId._id.toString();
      if (!learnersMap.has(userId)) {
        learnersMap.set(userId, {
          _id: cred.userId._id,
          name: cred.userId.name,
          email: cred.userId.email,
          credentialsCount: 0,
          verifiedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          skills: new Set(),
          latestCredential: cred.createdAt,
        });
      }
      const learner = learnersMap.get(userId);
      learner.credentialsCount++;
      if (cred.verificationStatus === 'verified') learner.verifiedCount++;
      if (cred.verificationStatus === 'pending') learner.pendingCount++;
      if (cred.verificationStatus === 'rejected') learner.rejectedCount++;
      cred.skills.forEach(skill => learner.skills.add(skill));
      
      // Update latest credential date
      if (new Date(cred.createdAt) > new Date(learner.latestCredential)) {
        learner.latestCredential = cred.createdAt;
      }
    });

    // Convert to array
    let learners = Array.from(learnersMap.values()).map(learner => ({
      ...learner,
      skills: Array.from(learner.skills),
    }));

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      learners = learners.filter(learner => 
        learner.name.toLowerCase().includes(searchLower) ||
        learner.email.toLowerCase().includes(searchLower) ||
        learner.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (status) {
      learners = learners.filter(learner => {
        if (status === 'verified') return learner.verifiedCount > 0;
        if (status === 'pending') return learner.pendingCount > 0;
        if (status === 'rejected') return learner.rejectedCount > 0;
        return true;
      });
    }

    // Sort learners
    learners.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle string sorting
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      // Handle date sorting
      if (sortBy === 'latestCredential') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    // Calculate pagination
    const total = learners.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedLearners = learners.slice(skip, skip + limit);

    res.json({
      learners: paginatedLearners,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /issuer/learners/:id
export const getLearnerDetails = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'User ID');
    
    let issuerId;
    
    if (req.issuer) {
      issuerId = req.issuer._id;
    } else if (req.user && req.user.role === 'Issuer') {
      const issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        return res.status(404).json({ error: 'Issuer not found' });
      }
      issuerId = issuer._id;
    } else {
      return res.status(403).json({ error: 'Not authorized as issuer' });
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'Learner not found' });
    }

    const profile = await LearnerProfile.findOne({ userId: user._id });
    const credentials = await Credential.find({ 
      userId: user._id, 
      issuerId 
    }).sort({ createdAt: -1 });

    res.json({
      user,
      profile,
      credentials,
    });
  } catch (error) {
    next(error);
  }
};

// GET /issuer/pending-verifications - With pagination and search
export const getPendingVerifications = async (req, res, next) => {
  try {
    let issuerId;
    
    if (req.issuer) {
      issuerId = req.issuer._id;
    } else if (req.user && req.user.role === 'Issuer') {
      const issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        return res.json({
          credentials: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        });
      }
      issuerId = issuer._id;
    } else {
      return res.status(403).json({ error: 'Not authorized as issuer' });
    }

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { 
      issuerId,
      verificationStatus: 'pending'
    };

    // Get total count
    const total = await Credential.countDocuments(query);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Fetch credentials
    let credentials = await Credential.find(query)
      .populate('userId', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      credentials = credentials.filter(cred => 
        cred.title.toLowerCase().includes(searchLower) ||
        (cred.userId && cred.userId.name.toLowerCase().includes(searchLower)) ||
        (cred.userId && cred.userId.email.toLowerCase().includes(searchLower))
      );
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      credentials,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /issuer/verify/:credentialId
// POST /issuer/create-learner
export const createLearner = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Validate mobile if provided
    if (mobile && !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: 'Mobile number must be exactly 10 digits' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create learner user
    const user = new User({
      name,
      email,
      mobile: mobile || undefined,
      passwordHash: password, // Will be hashed by pre-save hook
      role: 'Learner',
    });

    await user.save();

    // Create learner profile
    try {
      await LearnerProfile.create({ userId: user._id });
    } catch (profileError) {
      // If profile creation fails, delete the user to maintain consistency
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    logger.info(`Learner created by issuer: ${email}`);

    res.status(201).json({
      message: 'Learner account created successfully',
      learner: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /issuer/verify/:credentialId
export const verifyCredential = async (req, res, next) => {
  try {
    const { status, notes } = req.body; // status: 'verified' or 'failed'
    
    if (!['verified', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be verified or failed' });
    }

    let issuerId;
    
    if (req.issuer) {
      issuerId = req.issuer._id;
    } else if (req.user && req.user.role === 'Issuer') {
      const issuer = await Issuer.findOne({ contactEmail: req.user.email });
      if (!issuer) {
        return res.status(404).json({ error: 'Issuer not found' });
      }
      issuerId = issuer._id;
    } else {
      return res.status(403).json({ error: 'Not authorized as issuer' });
    }

    const credential = await Credential.findOne({
      _id: req.params.credentialId,
      issuerId
    }).populate('userId', 'name email');

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const previousStatus = credential.verificationStatus;

    // Update credential
    credential.verificationStatus = status;
    if (notes) {
      credential.verificationNotes = notes;
    }
    await credential.save();

    // If credential is being verified for the first time, update learner profile
    if (status === 'verified' && previousStatus !== 'verified') {
      const learnerProfile = await LearnerProfile.findOne({ userId: credential.userId._id });
      if (learnerProfile && credential.credits) {
        // Add credits to total
        const newTotalCredits = (learnerProfile.totalCredits || 0) + credential.credits;
        
        // Recalculate NSQF level
        const nsqfInfo = calculateNSQFLevel(newTotalCredits);
        
        // Update learner profile
        learnerProfile.totalCredits = newTotalCredits;
        learnerProfile.nsqfLevel = nsqfInfo.level;
        learnerProfile.levelName = nsqfInfo.levelName;
        await learnerProfile.save();
        
        logger.info(`Updated learner ${credential.userId._id} credits to ${newTotalCredits}, NSQF level to ${nsqfInfo.level}`);
      }
    }

    // If credential is being rejected after being verified, remove credits
    if (status === 'failed' && previousStatus === 'verified') {
      const learnerProfile = await LearnerProfile.findOne({ userId: credential.userId._id });
      if (learnerProfile && credential.credits) {
        // Remove credits from total
        const newTotalCredits = Math.max(0, (learnerProfile.totalCredits || 0) - credential.credits);
        
        // Recalculate NSQF level
        const nsqfInfo = calculateNSQFLevel(newTotalCredits);
        
        // Update learner profile
        learnerProfile.totalCredits = newTotalCredits;
        learnerProfile.nsqfLevel = nsqfInfo.level;
        learnerProfile.levelName = nsqfInfo.levelName;
        await learnerProfile.save();
        
        logger.info(`Removed credits from learner ${credential.userId._id}, new total: ${newTotalCredits}, NSQF level: ${nsqfInfo.level}`);
      }
    }

    // Send real-time notification to learner
    await sendNotification(
      req.app,
      credential.userId._id,
      status === 'verified' ? 'CredentialVerified' : 'System',
      status === 'verified' 
        ? `Your credential "${credential.title}" has been verified! You earned ${credential.credits} credits.`
        : `Your credential "${credential.title}" verification failed. ${notes || ''}`,
      { credentialId: credential._id }
    );

    // Send notification to issuer about verification action
    try {
      const issuerUser = await User.findOne({ 
        email: req.issuer?.contactEmail || req.user?.email,
        role: 'Issuer'
      });
      
      if (issuerUser) {
        await sendNotification(
          req.app,
          issuerUser._id,
          'System',
          `Credential "${credential.title}" has been ${status}`,
          { credentialId: credential._id, learnerId: credential.userId._id }
        );
      }
    } catch (issuerNotificationError) {
      logger.error('Failed to send issuer notification:', issuerNotificationError);
    }

    res.json({
      message: `Credential ${status}`,
      credential
    });
  } catch (error) {
    next(error);
  }
};

