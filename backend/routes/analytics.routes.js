import express from 'express';
const router = express.Router();
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

router.get('/summary', authenticate, authorize('Admin'), analyticsController.getSummary);
router.get('/skills-trend', authenticate, authorize('Admin'), analyticsController.getSkillsTrend);
router.get('/nsqf-distribution', authenticate, authorize('Admin'), analyticsController.getNSQFDistribution);

export default router;
