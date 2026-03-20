import express from 'express';
const router = express.Router();
import * as blogController from '../controllers/blog.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/categories', blogController.getCategories);
router.get('/:slug', blogController.getPostBySlug);

// Admin routes
router.get('/admin/all', authenticate, authorize('Admin'), blogController.getAllPostsAdmin);
router.post('/admin/create', authenticate, authorize('Admin'), blogController.createPost);
router.put('/admin/:id', authenticate, authorize('Admin'), blogController.updatePost);
router.delete('/admin/:id', authenticate, authorize('Admin'), blogController.deletePost);

export default router;
