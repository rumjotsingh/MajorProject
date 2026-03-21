import User from '../models/User.model.js';
import Issuer from '../models/Issuer.model.js';
import Credential from '../models/Credential.model.js';
import BlogPost from '../models/BlogPost.model.js';
import NSQFMapping from '../models/NSQFMapping.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.util.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import Employer from '../models/Employer.model.js';
import Subscription from '../models/Subscription.model.js';
import { calculateNSQFLevel } from '../utils/nsqf.util.js';
import logger from '../utils/logger.js';

// ==================== DASHBOARD ====================

export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalLearners,
      totalEmployers,
      totalIssuers,
      totalCredentials,
      verifiedCredentials,
      pendingCredentials,
      totalBlogs,
      publishedBlogs,
      pendingIssuers,
      approvedIssuers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Learner' }),
      User.countDocuments({ role: 'Employer' }),
      User.countDocuments({ role: 'Issuer' }),
      Credential.countDocuments(),
      Credential.countDocuments({ verificationStatus: 'verified' }),
      Credential.countDocuments({ verificationStatus: 'pending' }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ published: true }),
      Issuer.countDocuments({ status: 'pending' }),
      Issuer.countDocuments({ status: 'approved' }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        learners: totalLearners,
        employers: totalEmployers,
        issuers: totalIssuers,
      },
      credentials: {
        total: totalCredentials,
        verified: verifiedCredentials,
        pending: pendingCredentials,
      },
      blogs: {
        total: totalBlogs,
        published: publishedBlogs,
      },
      issuers: {
        pending: pendingIssuers,
        approved: approvedIssuers,
      },
    });
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .populate('currentSubscription')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-passwordHash')
      .populate('currentSubscription');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional data based on role
    let additionalData = {};
    if (user.role === 'Learner') {
      const profile = await LearnerProfile.findOne({ userId: id });
      const credentials = await Credential.find({ userId: id })
        .populate('issuerId', 'name')
        .sort({ createdAt: -1 });
      additionalData = { profile, credentials };
    } else if (user.role === 'Issuer') {
      const issuer = await Issuer.findOne({ contactEmail: user.email });
      const issuedCredentials = await Credential.countDocuments({ issuerId: issuer?._id });
      additionalData = { issuer, issuedCredentials };
    }

    res.json({ user, ...additionalData });
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

export const createLearner = async (req, res, next) => {
  try {
    const { name, email, password, bio, skills, education, experience } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'password'],
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create user account
    const user = new User({
      name,
      email,
      passwordHash: password,
      role: 'Learner',
      isActive: true,
    });
    await user.save();

    // Create learner profile
    const profile = new LearnerProfile({
      userId: user._id,
      bio: bio || '',
      skills: skills || [],
      education: education || [],
      experience: experience || [],
      totalCredits: 0,
      nsqfLevel: 1,
    });
    await profile.save();

    logger.info(`Learner created by admin: ${user._id}`);
    res.status(201).json({
      message: 'Learner created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    logger.error('Error creating learner:', error);
    next(error);
  }
};

export const updateLearnerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bio, skills, education, experience } = req.body;

    const profile = await LearnerProfile.findOne({ userId: id });
    if (!profile) {
      return res.status(404).json({ error: 'Learner profile not found' });
    }

    // Update profile fields
    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills;
    if (education !== undefined) profile.education = education;
    if (experience !== undefined) profile.experience = experience;

    await profile.save();

    logger.info(`Learner profile updated by admin: ${id}`);
    res.json({
      message: 'Learner profile updated successfully',
      profile,
    });
  } catch (error) {
    logger.error('Error updating learner profile:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'Admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete associated data
    if (user.role === 'Learner') {
      await Promise.all([
        LearnerProfile.deleteOne({ userId: id }),
        Credential.deleteMany({ userId: id }),
      ]);
    } else if (user.role === 'Issuer') {
      const issuer = await Issuer.findOne({ contactEmail: user.email });
      if (issuer) {
        await Issuer.deleteOne({ _id: issuer._id });
      }
    } else if (user.role === 'Employer') {
      await Employer.deleteOne({ userId: id });
    }

    await User.deleteOne({ _id: id });

    logger.info(`User deleted by admin: ${id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};

// ==================== ISSUER MANAGEMENT ====================

export const getIssuers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const [issuers, total] = await Promise.all([
      Issuer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Issuer.countDocuments(filter),
    ]);

    // Get credential counts for each issuer
    const issuersWithStats = await Promise.all(
      issuers.map(async (issuer) => {
        const credentialCount = await Credential.countDocuments({ issuerId: issuer._id });
        return {
          ...issuer.toObject(),
          credentialCount,
        };
      })
    );

    res.json({
      issuers: issuersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching issuers:', error);
    next(error);
  }
};

export const getIssuerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issuer = await Issuer.findById(id);
    if (!issuer) {
      return res.status(404).json({ error: 'Issuer not found' });
    }

    const [credentialCount, recentCredentials] = await Promise.all([
      Credential.countDocuments({ issuerId: id }),
      Credential.find({ issuerId: id })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      issuer,
      stats: {
        credentialCount,
      },
      recentCredentials,
    });
  } catch (error) {
    logger.error('Error fetching issuer:', error);
    next(error);
  }
};

export const approveIssuer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issuer = await Issuer.findById(id);
    if (!issuer) {
      return res.status(404).json({ error: 'Issuer not found' });
    }

    issuer.status = 'approved';
    await issuer.save();

    logger.info(`Issuer approved by admin: ${id}`);
    res.json({ message: 'Issuer approved successfully', issuer });
  } catch (error) {
    logger.error('Error approving issuer:', error);
    next(error);
  }
};

export const rejectIssuer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const issuer = await Issuer.findById(id);
    if (!issuer) {
      return res.status(404).json({ error: 'Issuer not found' });
    }

    issuer.status = 'suspended';
    await issuer.save();

    logger.info(`Issuer rejected by admin: ${id}`, { reason });
    res.json({ message: 'Issuer rejected successfully', issuer });
  } catch (error) {
    logger.error('Error rejecting issuer:', error);
    next(error);
  }
};

export const createIssuer = async (req, res, next) => {
  try {
    const { name, contactEmail, mobile, password, status } = req.body;

    // Validate required fields
    if (!name || !contactEmail || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'contactEmail', 'password'],
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: contactEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create user account
    const user = new User({
      name,
      email: contactEmail,
      passwordHash: password,
      role: 'Issuer',
      isActive: true,
    });
    await user.save();

    // Generate API key
    const crypto = await import('crypto');
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Create issuer profile
    const issuer = new Issuer({
      name,
      contactEmail,
      mobile: mobile || '',
      apiKey,
      status: status || 'pending',
    });
    await issuer.save();

    logger.info(`Issuer created by admin: ${issuer._id}`);
    res.status(201).json({
      message: 'Issuer created successfully',
      issuer,
    });
  } catch (error) {
    logger.error('Error creating issuer:', error);
    next(error);
  }
};

export const updateIssuer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contactEmail, mobile, status } = req.body;

    const issuer = await Issuer.findById(id);
    if (!issuer) {
      return res.status(404).json({ error: 'Issuer not found' });
    }

    // Update issuer fields
    if (name) issuer.name = name;
    if (contactEmail) issuer.contactEmail = contactEmail;
    if (mobile !== undefined) issuer.mobile = mobile;
    if (status) issuer.status = status;

    await issuer.save();

    // Update user account if email or name changed
    if (name || contactEmail) {
      const user = await User.findOne({ email: issuer.contactEmail });
      if (user) {
        if (name) user.name = name;
        if (contactEmail) user.email = contactEmail;
        await user.save();
      }
    }

    logger.info(`Issuer updated by admin: ${id}`);
    res.json({
      message: 'Issuer updated successfully',
      issuer,
    });
  } catch (error) {
    logger.error('Error updating issuer:', error);
    next(error);
  }
};

export const deleteIssuer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issuer = await Issuer.findById(id);
    if (!issuer) {
      return res.status(404).json({ error: 'Issuer not found' });
    }

    // Check if issuer has issued credentials
    const credentialCount = await Credential.countDocuments({ issuerId: id });
    if (credentialCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete issuer with existing credentials',
        credentialCount,
      });
    }

    // Delete issuer profile
    await Issuer.deleteOne({ _id: id });

    // Delete associated user account
    await User.deleteOne({ email: issuer.contactEmail });

    logger.info(`Issuer deleted by admin: ${id}`);
    res.json({ message: 'Issuer deleted successfully' });
  } catch (error) {
    logger.error('Error deleting issuer:', error);
    next(error);
  }
};

// ==================== CREDENTIAL MANAGEMENT ====================

export const getCredentials = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, issuerId, userId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.verificationStatus = status;
    if (issuerId) filter.issuerId = issuerId;
    if (userId) filter.userId = userId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const [credentials, total] = await Promise.all([
      Credential.find(filter)
        .populate('userId', 'name email')
        .populate('issuerId', 'name contactEmail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Credential.countDocuments(filter),
    ]);

    res.json({
      credentials,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching credentials:', error);
    next(error);
  }
};

export const getCredentialById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const credential = await Credential.findById(id)
      .populate('userId', 'name email')
      .populate('issuerId', 'name contactEmail');

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json({ credential });
  } catch (error) {
    logger.error('Error fetching credential:', error);
    next(error);
  }
};

export const approveCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const wasVerified = credential.verificationStatus === 'verified';

    credential.verificationStatus = 'verified';
    if (notes) credential.verificationNotes = notes;
    await credential.save();

    // Update learner profile NSQF level if not already verified
    if (!wasVerified) {
      const profile = await LearnerProfile.findOne({ userId: credential.userId });
      if (profile) {
        profile.totalCredits = (profile.totalCredits || 0) + credential.credits;
        profile.nsqfLevel = calculateNSQFLevel(profile.totalCredits);
        await profile.save();
      }
    }

    logger.info(`Credential approved by admin: ${id}`);
    res.json({ message: 'Credential approved successfully', credential });
  } catch (error) {
    logger.error('Error approving credential:', error);
    next(error);
  }
};

export const rejectCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const wasVerified = credential.verificationStatus === 'verified';

    credential.verificationStatus = 'failed';
    if (notes) credential.verificationNotes = notes;
    await credential.save();

    // Remove credits from learner profile if was previously verified
    if (wasVerified) {
      const profile = await LearnerProfile.findOne({ userId: credential.userId });
      if (profile) {
        profile.totalCredits = Math.max(0, (profile.totalCredits || 0) - credential.credits);
        profile.nsqfLevel = calculateNSQFLevel(profile.totalCredits);
        await profile.save();
      }
    }

    logger.info(`Credential rejected by admin: ${id}`, { notes });
    res.json({ message: 'Credential rejected successfully', credential });
  } catch (error) {
    logger.error('Error rejecting credential:', error);
    next(error);
  }
};

export const deleteCredential = async (req, res, next) => {
  try {
    const { id } = req.params;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Remove credits from learner profile if verified
    if (credential.verificationStatus === 'verified') {
      const profile = await LearnerProfile.findOne({ userId: credential.userId });
      if (profile) {
        profile.totalCredits = Math.max(0, (profile.totalCredits || 0) - credential.credits);
        profile.nsqfLevel = calculateNSQFLevel(profile.totalCredits);
        await profile.save();
      }
    }

    await Credential.deleteOne({ _id: id });

    logger.info(`Credential deleted by admin: ${id}`);
    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    logger.error('Error deleting credential:', error);
    next(error);
  }
};

// ==================== BLOG MANAGEMENT ====================

export const getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, published, category, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (published !== undefined) filter.published = published === 'true';
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      BlogPost.find(filter)
        .populate('authorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BlogPost.countDocuments(filter),
    ]);

    res.json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching blogs:', error);
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findById(id).populate('authorId', 'name email');

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ blog });
  } catch (error) {
    logger.error('Error fetching blog:', error);
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, coverImage, tags, published } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'excerpt', 'content', 'category'],
      });
    }

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} min read`;

    const blog = new BlogPost({
      title,
      excerpt,
      content,
      category,
      coverImage: coverImage || 'gradient-1',
      author: req.user.name,
      authorId: req.user.userId,
      readTime,
      tags: tags || [],
      published: published || false,
    });

    await blog.save();

    logger.info(`Blog post created by admin: ${blog._id}`);
    res.status(201).json({
      message: 'Blog post created successfully',
      blog,
    });
  } catch (error) {
    logger.error('Error creating blog:', error);
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, coverImage, tags, published } = req.body;

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Update fields
    if (title) blog.title = title;
    if (excerpt) blog.excerpt = excerpt;
    if (content) {
      blog.content = content;
      // Recalculate read time
      const wordCount = content.split(/\s+/).length;
      blog.readTime = `${Math.ceil(wordCount / 200)} min read`;
    }
    if (category) blog.category = category;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (tags !== undefined) blog.tags = tags;
    if (published !== undefined) blog.published = published;

    await blog.save();

    logger.info(`Blog post updated by admin: ${id}`);
    res.json({
      message: 'Blog post updated successfully',
      blog,
    });
  } catch (error) {
    logger.error('Error updating blog:', error);
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    await BlogPost.deleteOne({ _id: id });

    logger.info(`Blog post deleted by admin: ${id}`);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    logger.error('Error deleting blog:', error);
    next(error);
  }
};

export const publishBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    blog.published = true;
    if (!blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    await blog.save();

    logger.info(`Blog post published by admin: ${id}`);
    res.json({
      message: 'Blog post published successfully',
      blog,
    });
  } catch (error) {
    logger.error('Error publishing blog:', error);
    next(error);
  }
};

export const unpublishBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    blog.published = false;
    await blog.save();

    logger.info(`Blog post unpublished by admin: ${id}`);
    res.json({
      message: 'Blog post unpublished successfully',
      blog,
    });
  } catch (error) {
    logger.error('Error unpublishing blog:', error);
    next(error);
  }
};

export const getBlogCategories = async (req, res, next) => {
  try {
    const categories = await BlogPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const allCategories = ['Technology', 'Career', 'Education', 'Trends', 'Business', 'Inspiration'];
    
    const categoriesWithCounts = allCategories.map(cat => {
      const found = categories.find(c => c._id === cat);
      return {
        category: cat,
        count: found ? found.count : 0,
      };
    });

    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    logger.error('Error fetching blog categories:', error);
    next(error);
  }
};

// ==================== NSQF MANAGEMENT ====================

export const getNSQFLevels = async (req, res, next) => {
  try {
    const levels = Array.from({ length: 10 }, (_, i) => ({
      _id: `level-${i + 1}`, // Generate a unique ID for each level
      level: i + 1,
      title: `NSQF Level ${i + 1}`,
      description: `National Skills Qualifications Framework Level ${i + 1}`,
      minCredits: i * 40 + (i === 0 ? 0 : 1), // Level 1: 0-40, Level 2: 41-80, etc.
      maxCredits: (i + 1) * 40,
    }));

    res.json({ levels });
  } catch (error) {
    logger.error('Error fetching NSQF levels:', error);
    next(error);
  }
};

export const createNSQFLevel = async (req, res, next) => {
  try {
    const { level, description } = req.body;

    if (!level || level < 1 || level > 10) {
      return res.status(400).json({ error: 'Invalid NSQF level (1-10)' });
    }

    // This is informational only - levels are calculated automatically
    res.json({
      message: 'NSQF levels are automatically calculated based on credits',
      level,
      creditRange: `${(level - 1) * 40 + 1}-${level * 40}`,
    });
  } catch (error) {
    logger.error('Error creating NSQF level:', error);
    next(error);
  }
};

export const updateNSQFLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    // NSQF levels are system-defined and cannot be modified
    res.json({
      message: 'NSQF levels are system-defined and calculated automatically',
    });
  } catch (error) {
    logger.error('Error updating NSQF level:', error);
    next(error);
  }
};

export const deleteNSQFLevel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // NSQF levels cannot be deleted
    res.status(400).json({
      error: 'NSQF levels are system-defined and cannot be deleted',
    });
  } catch (error) {
    logger.error('Error deleting NSQF level:', error);
    next(error);
  }
};

export const createNSQFMapping = async (req, res, next) => {
  try {
    const { credentialType, nsqfLevel, description } = req.body;

    if (!credentialType) {
      return res.status(400).json({ error: 'Credential type is required' });
    }

    if (!nsqfLevel || nsqfLevel < 1 || nsqfLevel > 10) {
      return res.status(400).json({ error: 'Invalid NSQF level (1-10)' });
    }

    const mapping = new NSQFMapping({
      skill: credentialType, // Store as skill field in the model
      nsqfLevel,
      description: description || '',
      stackableNext: [],
      recommendedCourses: [],
    });

    await mapping.save();

    logger.info(`NSQF mapping created by admin: ${mapping._id}`);
    
    // Return with credentialType field for frontend compatibility
    const responseMapping = {
      _id: mapping._id,
      credentialType: mapping.skill,
      nsqfLevel: mapping.nsqfLevel,
      description: mapping.description,
    };
    
    res.status(201).json({ 
      message: 'NSQF mapping created successfully', 
      mapping: responseMapping 
    });
  } catch (error) {
    logger.error('Error creating NSQF mapping:', error);
    next(error);
  }
};

export const getNSQFMappings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, nsqfLevel, skill } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (nsqfLevel) filter.nsqfLevel = parseInt(nsqfLevel);
    if (skill) filter.skill = { $regex: skill, $options: 'i' };

    const [mappings, total] = await Promise.all([
      NSQFMapping.find(filter)
        .populate('credentialId', 'title')
        .sort({ nsqfLevel: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      NSQFMapping.countDocuments(filter),
    ]);

    // Transform mappings to match frontend expectations
    const transformedMappings = mappings.map(mapping => ({
      _id: mapping._id,
      credentialType: mapping.skill, // Map skill to credentialType for frontend
      nsqfLevel: mapping.nsqfLevel,
      description: mapping.description,
    }));

    res.json({
      mappings: transformedMappings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching NSQF mappings:', error);
    next(error);
  }
};

export const deleteNSQFMapping = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mapping = await NSQFMapping.findById(id);
    if (!mapping) {
      return res.status(404).json({ error: 'NSQF mapping not found' });
    }

    await NSQFMapping.deleteOne({ _id: id });

    logger.info(`NSQF mapping deleted by admin: ${id}`);
    res.json({ message: 'NSQF mapping deleted successfully' });
  } catch (error) {
    logger.error('Error deleting NSQF mapping:', error);
    next(error);
  }
};

// ==================== EMPLOYER MANAGEMENT ====================

export const getEmployers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, verified, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (verified !== undefined) filter.verified = verified === 'true';
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const [employers, total] = await Promise.all([
      Employer.find(filter)
        .populate('userId', 'name email isActive createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employer.countDocuments(filter),
    ]);

    res.json({
      employers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching employers:', error);
    next(error);
  }
};

export const getEmployerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id).populate('userId', 'name email isActive createdAt');

    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    res.json({ employer });
  } catch (error) {
    logger.error('Error fetching employer:', error);
    next(error);
  }
};

export const createEmployer = async (req, res, next) => {
  try {
    const { companyName, contactEmail, mobile, password } = req.body;

    // Validate required fields
    if (!companyName || !contactEmail || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['companyName', 'contactEmail', 'password'],
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: contactEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create user account
    const user = new User({
      name: companyName,
      email: contactEmail,
      passwordHash: password,
      role: 'Employer',
      isActive: true,
    });
    await user.save();

    // Create employer profile
    const employer = new Employer({
      userId: user._id,
      companyName,
      contactEmail,
      mobile: mobile || '',
      verified: false,
    });
    await employer.save();

    logger.info(`Employer created by admin: ${employer._id}`);
    res.status(201).json({
      message: 'Employer created successfully',
      employer: await employer.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error creating employer:', error);
    next(error);
  }
};

export const updateEmployer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyName, contactEmail, mobile, verified } = req.body;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    // Update employer fields
    if (companyName) employer.companyName = companyName;
    if (contactEmail) employer.contactEmail = contactEmail;
    if (mobile !== undefined) employer.mobile = mobile;
    if (verified !== undefined) employer.verified = verified;

    await employer.save();

    // Update user name if company name changed
    if (companyName) {
      await User.findByIdAndUpdate(employer.userId, { name: companyName });
    }

    logger.info(`Employer updated by admin: ${id}`);
    res.json({
      message: 'Employer updated successfully',
      employer: await employer.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error updating employer:', error);
    next(error);
  }
};

export const verifyEmployer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    employer.verified = true;
    await employer.save();

    logger.info(`Employer verified by admin: ${id}`);
    res.json({
      message: 'Employer verified successfully',
      employer: await employer.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error verifying employer:', error);
    next(error);
  }
};

export const unverifyEmployer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    employer.verified = false;
    await employer.save();

    logger.info(`Employer unverified by admin: ${id}`);
    res.json({
      message: 'Employer verification removed successfully',
      employer: await employer.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error unverifying employer:', error);
    next(error);
  }
};

export const deleteEmployer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    // Delete employer profile
    await Employer.deleteOne({ _id: id });

    // Delete associated user account
    await User.deleteOne({ _id: employer.userId });

    logger.info(`Employer deleted by admin: ${id}`);
    res.json({ message: 'Employer deleted successfully' });
  } catch (error) {
    logger.error('Error deleting employer:', error);
    next(error);
  }
};

export const getEmployerStats = async (req, res, next) => {
  try {
    const [totalEmployers, verifiedEmployers, activeEmployers] = await Promise.all([
      Employer.countDocuments(),
      Employer.countDocuments({ verified: true }),
      Employer.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: { 'user.isActive': true } },
        { $count: 'count' },
      ]),
    ]);

    res.json({
      total: totalEmployers,
      verified: verifiedEmployers,
      active: activeEmployers[0]?.count || 0,
      unverified: totalEmployers - verifiedEmployers,
    });
  } catch (error) {
    logger.error('Error fetching employer stats:', error);
    next(error);
  }
};

// ==================== SUBSCRIPTION MANAGEMENT ====================

export const getSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, plan, status, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (plan) filter.plan = plan;
    if (status) filter.status = status;

    let subscriptions = await Subscription.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Apply search filter after population
    if (search) {
      subscriptions = subscriptions.filter(sub => 
        sub.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        sub.userId?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Subscription.countDocuments(filter);

    res.json({
      subscriptions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching subscriptions:', error);
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id)
      .populate('userId', 'name email role createdAt');

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Get usage stats
    const credentialCount = await Credential.countDocuments({ 
      userId: subscription.userId._id,
      verificationStatus: 'verified'
    });

    res.json({ 
      subscription,
      usage: {
        credentials: credentialCount,
        maxCredentials: subscription.features.maxCredentials,
      }
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const { userId, plan, duration } = req.body;

    // Validate required fields
    if (!userId || !plan) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'plan'],
      });
    }

    // Validate plan
    const validPlans = ['free', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cancel existing active subscriptions
    await Subscription.updateMany(
      { userId, status: 'active' },
      { status: 'cancelled' }
    );

    // Define plan features
    const planFeatures = {
      free: {
        maxCredentials: 10,
        maxSkills: 20,
        aiRecommendations: false,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
        analytics: false,
      },
      pro: {
        maxCredentials: 100,
        maxSkills: 100,
        aiRecommendations: true,
        prioritySupport: true,
        customBranding: false,
        apiAccess: true,
        analytics: true,
      },
      enterprise: {
        maxCredentials: -1,
        maxSkills: -1,
        aiRecommendations: true,
        prioritySupport: true,
        customBranding: true,
        apiAccess: true,
        analytics: true,
      },
    };

    const planPrices = {
      free: 0,
      pro: 999,
      enterprise: 4999,
    };

    // Calculate end date
    const endDate = new Date();
    const durationDays = duration || (plan === 'free' ? 365 : 30);
    endDate.setDate(endDate.getDate() + durationDays);

    // Create subscription
    const subscription = new Subscription({
      userId,
      plan,
      status: 'active',
      amount: planPrices[plan],
      currency: 'INR',
      startDate: new Date(),
      endDate,
      features: planFeatures[plan],
    });
    await subscription.save();

    // Update user subscription reference
    await User.findByIdAndUpdate(userId, {
      currentSubscription: subscription._id,
    });

    logger.info(`Subscription created by admin: ${subscription._id}`);
    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: await subscription.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan, status, endDate, autoRenew } = req.body;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Update plan and features if plan changed
    if (plan && plan !== subscription.plan) {
      const planFeatures = {
        free: {
          maxCredentials: 10,
          maxSkills: 20,
          aiRecommendations: false,
          prioritySupport: false,
          customBranding: false,
          apiAccess: false,
          analytics: false,
        },
        pro: {
          maxCredentials: 100,
          maxSkills: 100,
          aiRecommendations: true,
          prioritySupport: true,
          customBranding: false,
          apiAccess: true,
          analytics: true,
        },
        enterprise: {
          maxCredentials: -1,
          maxSkills: -1,
          aiRecommendations: true,
          prioritySupport: true,
          customBranding: true,
          apiAccess: true,
          analytics: true,
        },
      };

      subscription.plan = plan;
      subscription.features = planFeatures[plan];
    }

    if (status) subscription.status = status;
    if (endDate) subscription.endDate = new Date(endDate);
    if (autoRenew !== undefined) subscription.autoRenew = autoRenew;

    await subscription.save();

    logger.info(`Subscription updated by admin: ${id}`);
    res.json({
      message: 'Subscription updated successfully',
      subscription: await subscription.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error updating subscription:', error);
    next(error);
  }
};

export const cancelSubscriptionAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    logger.info(`Subscription cancelled by admin: ${id}`);
    res.json({
      message: 'Subscription cancelled successfully',
      subscription: await subscription.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Remove subscription reference from user
    await User.findByIdAndUpdate(subscription.userId, {
      $unset: { currentSubscription: 1 },
    });

    await Subscription.deleteOne({ _id: id });

    logger.info(`Subscription deleted by admin: ${id}`);
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    logger.error('Error deleting subscription:', error);
    next(error);
  }
};

export const getSubscriptionStats = async (req, res, next) => {
  try {
    const [
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      expiredSubscriptions,
      planDistribution,
      revenueStats,
    ] = await Promise.all([
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'cancelled' }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      total: totalSubscriptions,
      active: activeSubscriptions,
      cancelled: cancelledSubscriptions,
      expired: expiredSubscriptions,
      planDistribution,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
    });
  } catch (error) {
    logger.error('Error fetching subscription stats:', error);
    next(error);
  }
};

export const extendSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    if (!days || days < 1) {
      return res.status(400).json({ error: 'Invalid duration' });
    }

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Extend end date
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(days));
    subscription.endDate = newEndDate;

    // Reactivate if expired
    if (subscription.status === 'expired') {
      subscription.status = 'active';
    }

    await subscription.save();

    logger.info(`Subscription extended by admin: ${id} (+${days} days)`);
    res.json({
      message: `Subscription extended by ${days} days`,
      subscription: await subscription.populate('userId', 'name email'),
    });
  } catch (error) {
    logger.error('Error extending subscription:', error);
    next(error);
  }
};

// ==================== ANALYTICS ====================

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCredentials,
      totalIssuers,
      credentialsByMonth,
      usersByRole,
      credentialsByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      Credential.countDocuments(),
      Issuer.countDocuments({ status: 'approved' }),
      Credential.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Credential.aggregate([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      overview: {
        totalUsers,
        totalCredentials,
        totalIssuers,
      },
      credentialsByMonth,
      usersByRole,
      credentialsByStatus,
    });
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    next(error);
  }
};

export const getAnalyticsUsers = async (req, res, next) => {
  try {
    const [usersByRole, userGrowth, activeUsers] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
      User.countDocuments({ isActive: true }),
    ]);

    res.json({
      usersByRole,
      userGrowth,
      activeUsers,
    });
  } catch (error) {
    logger.error('Error fetching user analytics:', error);
    next(error);
  }
};

export const getAnalyticsCredentials = async (req, res, next) => {
  try {
    const [
      credentialsByStatus,
      credentialsByNSQF,
      topSkills,
      credentialGrowth,
    ] = await Promise.all([
      Credential.aggregate([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      ]),
      Credential.aggregate([
        { $match: { verificationStatus: 'verified' } },
        { $group: { _id: '$nsqfLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Credential.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Credential.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      credentialsByStatus,
      credentialsByNSQF,
      topSkills,
      credentialGrowth,
    });
  } catch (error) {
    logger.error('Error fetching credential analytics:', error);
    next(error);
  }
};

export const getAnalyticsIssuers = async (req, res, next) => {
  try {
    const [issuersByStatus, topIssuers, issuerGrowth] = await Promise.all([
      Issuer.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Issuer.aggregate([
        { $match: { status: 'approved' } },
        {
          $lookup: {
            from: 'credentials',
            localField: '_id',
            foreignField: 'issuerId',
            as: 'credentials',
          },
        },
        {
          $project: {
            name: 1,
            contactEmail: 1,
            credentialCount: { $size: '$credentials' },
          },
        },
        { $sort: { credentialCount: -1 } },
        { $limit: 10 },
      ]),
      Issuer.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      issuersByStatus,
      topIssuers,
      issuerGrowth,
    });
  } catch (error) {
    logger.error('Error fetching issuer analytics:', error);
    next(error);
  }
};
