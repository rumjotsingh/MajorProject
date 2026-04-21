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

// GET /recommendations/jobs/relevant - Scan and return only relevant open jobs (requires AI feature)
router.get('/jobs/relevant', requireFeature('aiRecommendations'), recommendationController.getRelevantJobs);

// POST /recommendations/jobs/:jobId/apply - Apply to a relevant job
router.post('/jobs/:jobId/apply', recommendationController.applyToRelevantJob);

// GET /recommendations/jobs/applications - Learner application tracker
router.get('/jobs/applications', recommendationController.getMyApplications);

// PATCH /recommendations/jobs/applications/:applicationId/withdraw - Withdraw application
router.patch('/jobs/applications/:applicationId/withdraw', recommendationController.withdrawMyApplication);

export default router;
