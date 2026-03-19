import express from 'express';
const router = express.Router();
import * as careerPathController from '../controllers/careerPath.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

// Public routes
router.get('/', careerPathController.getAllCareerPaths);
router.get('/:id', careerPathController.getCareerPathById);

// Authenticated routes
router.get('/suggestions/me', authenticate, careerPathController.getCareerSuggestions);

// Admin routes
router.post('/', authenticate, authorize('Admin'), careerPathController.createCareerPath);
router.put('/:id', authenticate, authorize('Admin'), careerPathController.updateCareerPath);
router.delete('/:id', authenticate, authorize('Admin'), careerPathController.deleteCareerPath);

export default router;
