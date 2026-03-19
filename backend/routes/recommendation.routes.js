import express from 'express';
const router = express.Router();
import * as recommendationController from '../controllers/recommendation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

// All routes require authentication
router.use(authenticate);

// POST /recommendations/analyze - Analyze user's skills
router.post('/analyze', recommendationController.analyzeSkills);

// POST /recommendations/skill-gap - Calculate skill gap for career path
router.post('/skill-gap', recommendationController.calculateSkillGap);

// POST /recommendations/generate - Generate personalized recommendations
router.post('/generate', recommendationController.generateRecommendations);

// GET /recommendations/career-paths - Get available career paths
router.get('/career-paths', recommendationController.getCareerPaths);

// POST /recommendations/extract-skills - Extract skills from text using AI
router.post('/extract-skills', recommendationController.extractSkillsFromText);

export default router;
