import express from 'express';
const router = express.Router();
import * as nsqfController from '../controllers/nsqf.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

router.get('/levels', nsqfController.getLevels);
router.get('/my-level', authenticate, nsqfController.getMyNSQFLevel);
router.get('/calculate', nsqfController.calculateLevel);
router.post('/map', authenticate, authorize('Admin'), nsqfController.createMapping);
router.get('/stack/:userId', authenticate, nsqfController.getCareerPathway);

export default router;
