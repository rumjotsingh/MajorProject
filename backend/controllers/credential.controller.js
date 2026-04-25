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
import { recomputeLearnerProfileFromVerifiedCredentials } from '../services/profile-sync.service.js';
import { analyzeCredentialMetadata } from '../services/ai.service.js';

const sanitizeStringArray = (items = [], maxItems = 20, maxLength = 120) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .filter((item) => item.length <= maxLength)
    .slice(0, maxItems);
};

const toIsoOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'issueDate', 'credits', 'title']);
const ALLOWED_STATUSES = new Set(['pending', 'verified', 'failed']);
const ALLOWED_CREDENTIAL_TYPES = new Set(['micro-credential', 'course-certificate', 'degree', 'license', 'other']);

const buildCredentialResponse = (credentialDoc) => {
  const credential = credentialDoc.toObject ? credentialDoc.toObject() : credentialDoc;
  const issuerName = credential?.issuerId?.name || '';
  const keywords = Array.from(
    new Set([...(credential.skills || []), ...(credential.tags || [])].map((k) => String(k).trim()).filter(Boolean))
  );
  const lifecycleStatus = credential.revoked ? 'revoked' : credential.verificationStatus;

  return {
    id: credential._id,
    _id: credential._id,
    userId: credential.userId,
    issuerId: credential.issuerId,
    issuerIdRef: credential.issuerId?._id || credential.issuerId,
    issuerName,
    title: credential.title,
    description: credential.description || '',
    credentialType: credential.credentialType || 'micro-credential',
    category: credential.category || '',
    skills: credential.skills || [],
    tags: credential.tags || [],
    keywords,
    learningOutcomes: credential.learningOutcomes || [],
    credits: credential.credits,
    nsqfLevel: credential.nsqfLevel,
    issueDate: toIsoOrNull(credential.issueDate),
    expiryDate: toIsoOrNull(credential.expiryDate),
    assessmentType: credential.assessmentType || '',
    grade: credential.grade || '',
    score: credential.score || { value: null, max: null },
    durationHours: credential.durationHours ?? null,
    certificateUrl: credential.certificateUrl,
    evidenceUrls: credential.evidenceUrls || [],
    source: credential.source || { platform: '', externalId: '', uploadMethod: 'manual' },
    verificationStatus: credential.verificationStatus,
    lifecycleStatus,
    verificationNotes: credential.verificationNotes || '',
    revoked: Boolean(credential.revoked),
    revokeReason: credential.revokeReason || '',
    aiInsights: credential.aiInsights || {},
    aiSummary: credential?.aiInsights?.summary || '',
    createdAt: toIsoOrNull(credential.createdAt),
    updatedAt: toIsoOrNull(credential.updatedAt),
  };
};

const runCredentialAIEnrichment = async (credentialId) => {
  try {
    const credential = await Credential.findById(credentialId).lean();
    if (!credential) return;

    const aiInsights = await analyzeCredentialMetadata({
      title: credential.title,
      description: credential.description,
      providedSkills: credential.skills || [],
      learningOutcomes: credential.learningOutcomes || [],
      credentialType: credential.credentialType || 'micro-credential',
      category: credential.category || '',
    });

    const mergedSkills = Array.from(
      new Set([...(credential.skills || []), ...(aiInsights.extractedSkills || [])].map((skill) => String(skill).trim()).filter(Boolean))
    );

    await Credential.findByIdAndUpdate(credentialId, {
      $set: {
        aiInsights,
        skills: mergedSkills,
      },
    });
  } catch (error) {
    logger.error('Async credential AI enrichment failed:', { credentialId, error: error.message });
  }
};

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

    const {
      title,
      issuer,
      issueDate,
      expiryDate,
      skills,
      credits,
      description,
      credentialType,
      category,
      tags,
      learningOutcomes,
      assessmentType,
      grade,
      score,
      durationHours,
      evidenceUrls,
      source,
    } = metadata;

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
    if (Number.isNaN(new Date(issueDate).getTime())) {
      return res.status(400).json({ error: 'Issue date must be a valid date' });
    }
    if (expiryDate && Number.isNaN(new Date(expiryDate).getTime())) {
      return res.status(400).json({ error: 'Expiry date must be a valid date' });
    }
    if (expiryDate && new Date(expiryDate) < new Date(issueDate)) {
      return res.status(400).json({ error: 'Expiry date cannot be earlier than issue date' });
    }

    // Validate credits (mandatory field, range 1-40)
    if (!credits) {
      return res.status(400).json({ error: 'Credits field is required' });
    }

    const normalizedCredits = Number(credits);
    if (!validateCredits(normalizedCredits)) {
      return res.status(400).json({ 
        error: 'Invalid credits value. Must be an integer between 1 and 40' 
      });
    }
    if (score && score.max !== undefined && Number(score.max) <= 0) {
      return res.status(400).json({ error: 'Score max must be greater than 0' });
    }
    if (score && score.value !== undefined && score.max !== undefined && Number(score.value) > Number(score.max)) {
      return res.status(400).json({ error: 'Score value cannot be greater than score max' });
    }
    if (credentialType && !ALLOWED_CREDENTIAL_TYPES.has(String(credentialType).trim())) {
      return res.status(400).json({ error: 'Invalid credentialType' });
    }

    // Find or create issuer
    const normalizedIssuerName = issuer.trim().replace(/\s+/g, ' ');
    const escapedIssuer = normalizedIssuerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape for regex
    let issuerDoc = await Issuer.findOne({ name: { $regex: new RegExp(`^${escapedIssuer}$`, 'i') } });
    if (!issuerDoc) {
      issuerDoc = await Issuer.create({
        name: normalizedIssuerName,
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
    const potentialTotalCredits = (learnerProfile.totalCredits || 0) + normalizedCredits;
    const potentialNsqfInfo = calculateNSQFLevel(potentialTotalCredits);

    // Keep upload fast: persist first, run AI enrichment asynchronously.
    const normalizedSkills = sanitizeStringArray(skills, 25, 80);

    // Create credential with calculated NSQF level (for reference, but not counted yet)
    const credential = await Credential.create({
      userId: req.user.userId,
      issuerId: issuerDoc._id,
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      credentialType: typeof credentialType === 'string' && credentialType.trim() ? credentialType.trim() : 'micro-credential',
      category: typeof category === 'string' ? category.trim() : '',
      skills: normalizedSkills,
      tags: sanitizeStringArray(tags, 20, 50),
      learningOutcomes: sanitizeStringArray(learningOutcomes, 20, 200),
      credits: normalizedCredits,
      nsqfLevel: potentialNsqfInfo.level, // Stored for reference
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      assessmentType: typeof assessmentType === 'string' ? assessmentType.trim() : '',
      grade: typeof grade === 'string' ? grade.trim() : '',
      score: {
        value: score && Number.isFinite(Number(score.value)) ? Number(score.value) : null,
        max: score && Number.isFinite(Number(score.max)) ? Number(score.max) : null,
      },
      durationHours: Number.isFinite(Number(durationHours)) ? Number(durationHours) : null,
      certificateUrl,
      evidenceUrls: sanitizeStringArray(evidenceUrls, 10, 300),
      source: {
        platform: typeof source?.platform === 'string' ? source.platform.trim() : '',
        externalId: typeof source?.externalId === 'string' ? source.externalId.trim() : '',
        uploadMethod: typeof source?.uploadMethod === 'string' && source.uploadMethod.trim() ? source.uploadMethod.trim() : 'manual',
      },
      certificateHash,
      verificationStatus: 'pending',
      aiInsights: {
        summary: '',
        extractedSkills: normalizedSkills,
        suggestedCareerPaths: [],
        confidence: null,
        provider: '',
        model: '',
        status: 'not-run',
        reason: '',
        analyzedAt: null,
      },
    });

    // Skills are derived only from verified credentials.
    // Do not mutate learner profile skills for pending uploads.

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
      if (issuerDoc && issuerDoc.contactEmail) {
        // Find user account for this issuer (User email is lowercase, so use regex for safety)
        const escapedEmail = issuerDoc.contactEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const issuerUser = await User.findOne({ 
          email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') },
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

    // Fire-and-forget AI enrichment for better upload performance.
    runCredentialAIEnrichment(credential._id);

    // Return info - credits will be added after verification
    res.status(201).json({
      credentialId: credential._id,
      verificationStatus: credential.verificationStatus,
      creditsToBeEarned: normalizedCredits,
      currentTotalCredits: learnerProfile.totalCredits,
      currentNsqfLevel: learnerProfile.nsqfLevel,
      potentialNsqfLevel: potentialNsqfInfo.level,
      credential: buildCredentialResponse({ ...credential.toObject(), issuerId: { _id: issuerDoc._id, name: issuerDoc.name } }),
      message: `Credential uploaded successfully! After verification, you will earn ${credits} credits and reach NSQF Level ${potentialNsqfInfo.level} (${potentialNsqfInfo.levelName})`,
    });
  } catch (error) {
    next(error);
  }
};

// GET /credentials
export const getMyCredentials = async (req, res, next) => {
  try {
    const page = clamp(parseInt(req.query.page) || 1, 1, 100000);
    const limit = clamp(parseInt(req.query.limit) || 10, 1, 100);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim(); // verified, pending, failed
    const credentialType = String(req.query.credentialType || '').trim();
    const category = String(req.query.category || '').trim();
    const issueDateFrom = req.query.issueDateFrom ? new Date(req.query.issueDateFrom) : null;
    const issueDateTo = req.query.issueDateTo ? new Date(req.query.issueDateTo) : null;
    const sortBy = String(req.query.sortBy || 'createdAt').trim();
    const sortOrder = String(req.query.sortOrder || 'desc').trim().toLowerCase();
    const includeAiInsights = req.query.includeAiInsights === 'true';

    // Build query
    const query = { userId: req.user.userId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      if (!ALLOWED_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Invalid status filter' });
      }
      query.verificationStatus = status;
    }
    if (credentialType) {
      if (!ALLOWED_CREDENTIAL_TYPES.has(credentialType)) {
        return res.status(400).json({ error: 'Invalid credentialType filter' });
      }
      query.credentialType = credentialType;
    }
    if (category) {
      query.category = { $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
    }
    if (issueDateFrom || issueDateTo) {
      query.issueDate = {};
      if (issueDateFrom && !Number.isNaN(issueDateFrom.getTime())) {
        query.issueDate.$gte = issueDateFrom;
      }
      if (issueDateTo && !Number.isNaN(issueDateTo.getTime())) {
        query.issueDate.$lte = issueDateTo;
      }
    }
    const resolvedSortBy = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';
    const resolvedSortOrder = sortOrder === 'asc' ? 1 : -1;

    const selectFields = [
      'userId', 'issuerId', 'title', 'description', 'credentialType', 'category',
      'skills', 'tags', 'learningOutcomes', 'credits', 'nsqfLevel', 'issueDate',
      'expiryDate', 'assessmentType', 'grade', 'score', 'durationHours', 'certificateUrl',
      'evidenceUrls', 'source', 'verificationStatus', 'verificationNotes', 'revoked',
      'revokeReason', 'createdAt', 'updatedAt',
    ];
    if (includeAiInsights) {
      selectFields.push('aiInsights');
    }

    const [total, credentials, statusCounts] = await Promise.all([
      Credential.countDocuments(query),
      Credential.find(query)
        .select(selectFields.join(' '))
        .populate('issuerId', 'name')
        .sort({ [resolvedSortBy]: resolvedSortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Credential.aggregate([
        { $match: query },
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = { pending: 0, verified: 0, failed: 0 };
    for (const row of statusCounts) {
      if (row?._id && Object.prototype.hasOwnProperty.call(counts, row._id)) {
        counts[row._id] = row.count;
      }
    }

    res.json({
      credentials: credentials.map(buildCredentialResponse),
      summary: {
        total,
        counts,
      },
      filtersApplied: {
        status: status || null,
        credentialType: credentialType || null,
        category: category || null,
        issueDateFrom: toIsoOrNull(issueDateFrom),
        issueDateTo: toIsoOrNull(issueDateTo),
        sortBy: resolvedSortBy,
        sortOrder: resolvedSortOrder === 1 ? 'asc' : 'desc',
      },
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

    res.json(buildCredentialResponse(credential));
  } catch (error) {
    next(error);
  }
};

// PUT /credentials/:id
export const updateCredential = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'Credential ID');
    
    const {
      skills,
      title,
      credits,
      certificateUrl,
      issueDate,
      expiryDate,
      description,
      credentialType,
      category,
      tags,
      learningOutcomes,
      assessmentType,
      grade,
      score,
      durationHours,
      evidenceUrls,
      source,
    } = req.body;
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

    // Update allowed fields
    if (skills) credential.skills = sanitizeStringArray(skills, 30, 80);
    if (title) credential.title = String(title).trim();
    if (description !== undefined) credential.description = String(description || '').trim();
    if (credentialType !== undefined) {
      const normalizedCredentialType = String(credentialType || 'micro-credential').trim() || 'micro-credential';
      if (!ALLOWED_CREDENTIAL_TYPES.has(normalizedCredentialType)) {
        return res.status(400).json({ error: 'Invalid credentialType' });
      }
      credential.credentialType = normalizedCredentialType;
    }
    if (category !== undefined) credential.category = String(category || '').trim();
    if (tags !== undefined) credential.tags = sanitizeStringArray(tags, 20, 50);
    if (learningOutcomes !== undefined) credential.learningOutcomes = sanitizeStringArray(learningOutcomes, 20, 200);
    if (assessmentType !== undefined) credential.assessmentType = String(assessmentType || '').trim();
    if (grade !== undefined) credential.grade = String(grade || '').trim();
    if (certificateUrl) credential.certificateUrl = certificateUrl;
    if (issueDate) {
      const parsedIssueDate = new Date(issueDate);
      if (Number.isNaN(parsedIssueDate.getTime())) {
        return res.status(400).json({ error: 'Issue date must be a valid date' });
      }
      credential.issueDate = parsedIssueDate;
    }
    if (expiryDate !== undefined) {
      const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
      if (parsedExpiryDate && Number.isNaN(parsedExpiryDate.getTime())) {
        return res.status(400).json({ error: 'Expiry date must be a valid date' });
      }
      credential.expiryDate = parsedExpiryDate;
    }
    if (durationHours !== undefined) credential.durationHours = Number.isFinite(Number(durationHours)) ? Number(durationHours) : null;
    if (evidenceUrls !== undefined) credential.evidenceUrls = sanitizeStringArray(evidenceUrls, 10, 300);
    if (score !== undefined) {
      if (score && score.max !== undefined && Number(score.max) <= 0) {
        return res.status(400).json({ error: 'Score max must be greater than 0' });
      }
      if (score && score.value !== undefined && score.max !== undefined && Number(score.value) > Number(score.max)) {
        return res.status(400).json({ error: 'Score value cannot be greater than score max' });
      }
      credential.score = {
        value: score && Number.isFinite(Number(score.value)) ? Number(score.value) : null,
        max: score && Number.isFinite(Number(score.max)) ? Number(score.max) : null,
      };
    }
    if (source !== undefined) {
      credential.source = {
        platform: String(source?.platform || '').trim(),
        externalId: String(source?.externalId || '').trim(),
        uploadMethod: String(source?.uploadMethod || 'manual').trim() || 'manual',
      };
    }
    
    // Validate and update credits if changed
    if (credits !== undefined) {
      const normalizedCredits = Number(credits);
      if (!validateCredits(normalizedCredits)) {
        return res.status(400).json({ 
          error: 'Invalid credits value. Must be an integer between 1 and 40' 
        });
      }

      credential.credits = normalizedCredits;
    }

    if (credential.expiryDate && credential.issueDate && credential.expiryDate < credential.issueDate) {
      return res.status(400).json({ error: 'Expiry date cannot be earlier than issue date' });
    }

    // IMPORTANT: nsqfLevel is NEVER taken from user input - always calculated
    // Remove any nsqfLevel from request body to prevent manipulation

    // Refresh AI insights on update
    const aiInsights = await analyzeCredentialMetadata({
      title: credential.title,
      description: credential.description,
      providedSkills: credential.skills || [],
      learningOutcomes: credential.learningOutcomes || [],
      credentialType: credential.credentialType || 'micro-credential',
      category: credential.category || '',
    });
    credential.aiInsights = aiInsights;

    await credential.save();

    // Always recompute learner profile from verified credentials only.
    await recomputeLearnerProfileFromVerifiedCredentials(credential.userId);

    // Populate issuer before returning
    await credential.populate('issuerId', 'name');

    res.json(buildCredentialResponse(credential));
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

    await Credential.findByIdAndDelete(req.params.id);

    // Remove associated skills/credits immediately by recomputing from remaining verified credentials.
    await recomputeLearnerProfileFromVerifiedCredentials(credential.userId);

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
