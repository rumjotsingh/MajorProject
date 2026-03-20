import BlogPost from '../models/BlogPost.model.js';
import logger from '../utils/logger.js';

// GET /blog - Get all published blog posts (public)
export const getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, category, search } = req.query;
    
    const query = { published: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .select('-content') // Exclude full content for list view
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BlogPost.countDocuments(query),
    ]);
    
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /blog/:slug - Get single blog post by slug (public)
export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const post = await BlogPost.findOne({ slug, published: true });
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    res.json({ post });
  } catch (error) {
    next(error);
  }
};

// GET /blog/admin/all - Get all posts including drafts (admin only)
export const getAllPostsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    
    if (status === 'published') {
      query.published = true;
    } else if (status === 'draft') {
      query.published = false;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BlogPost.countDocuments(query),
    ]);
    
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /blog/admin/create - Create new blog post (admin only)
export const createPost = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, coverImage, tags, published } = req.body;
    
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} min read`;
    
    const post = await BlogPost.create({
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
    
    logger.info(`Blog post created: ${post._id} by ${req.user.name}`);
    
    res.status(201).json({
      message: 'Blog post created successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /blog/admin/:id - Update blog post (admin only)
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, coverImage, tags, published } = req.body;
    
    const post = await BlogPost.findById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Update fields
    if (title) post.title = title;
    if (excerpt) post.excerpt = excerpt;
    if (content) {
      post.content = content;
      // Recalculate read time
      const wordCount = content.split(/\s+/).length;
      post.readTime = `${Math.ceil(wordCount / 200)} min read`;
    }
    if (category) post.category = category;
    if (coverImage) post.coverImage = coverImage;
    if (tags) post.tags = tags;
    if (typeof published !== 'undefined') post.published = published;
    
    await post.save();
    
    logger.info(`Blog post updated: ${post._id} by ${req.user.name}`);
    
    res.json({
      message: 'Blog post updated successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /blog/admin/:id - Delete blog post (admin only)
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const post = await BlogPost.findByIdAndDelete(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    logger.info(`Blog post deleted: ${id} by ${req.user.name}`);
    
    res.json({
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /blog/categories - Get all categories with post counts (public)
export const getCategories = async (req, res, next) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllPosts,
  getPostBySlug,
  getAllPostsAdmin,
  createPost,
  updatePost,
  deletePost,
  getCategories,
};
