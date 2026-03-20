import express from 'express';
const router = express.Router();
import * as recommendationController from '../controllers/recommendation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireFeature } from '../middleware/subscription.middleware.js';

// All routes require authentication
router.use(authenticate);

// POST /recommendations/analyze - Analyze user's skills (requires AI feature)
router.post('/analyze', requireFeature('aiRecommendations'), recommendationController.analyzeSkills);

// POST /recommendations/skill-gap - Calculate skill gap for career path (requires AI feature)
router.post('/skill-gap', requireFeature('aiRecommendations'), recommendationController.calculateSkillGap);

// POST /recommendations/generate - Generate personalized recommendations (requires AI feature)
router.post('/generate', requireFeature('aiRecommendations'), recommendationController.generateRecommendations);

// GET /recommendations/career-paths - Get available career paths (free for all)
router.get('/career-paths', recommendationController.getCareerPaths);

// POST /recommendations/extract-skills - Extract skills from text using AI (requires AI feature)
router.post('/extract-skills', requireFeature('aiRecommendations'), recommendationController.extractSkillsFromText);

export default router;
