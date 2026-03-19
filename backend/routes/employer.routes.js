import express from 'express';
const router = express.Router();
import * as employerController from '../controllers/employer.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.middleware.js';
import { searchLimiter } from '../middleware/rateLimit.middleware.js';

router.post('/register', validate(schemas.employerRegister), employerController.registerEmployer);
router.get('/search', authenticate, authorize('Employer', 'Admin'), searchLimiter, employerController.searchLearners);
router.get('/profile/:learnerId', authenticate, authorize('Employer', 'Admin'), employerController.getLearnerProfile);
router.post('/verify', authenticate, authorize('Employer', 'Admin'), employerController.verifyCredential);
router.post('/contact', authenticate, authorize('Employer'), employerController.contactLearner);

export default router;
