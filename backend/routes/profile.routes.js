import express from 'express';
const router = express.Router();
import * as profileController from '../controllers/profile.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.middleware.js';
import { searchLimiter } from '../middleware/rateLimit.middleware.js';

router.get('/me', authenticate, authorize('Learner', 'Admin'), profileController.getMyProfile);
router.put('/me', authenticate, authorize('Learner'), validate(schemas.updateProfile), profileController.updateMyProfile);
router.get('/', authenticate, authorize('Employer', 'Admin'), searchLimiter, profileController.searchProfiles);
router.get('/:id/credentials', authenticate, profileController.getProfileCredentials);
router.get('/:id/skills', authenticate, profileController.getProfileSkills);

export default router;
