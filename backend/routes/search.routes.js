import express from 'express';
const router = express.Router();
import * as searchController from '../controllers/search.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

// Role-specific search endpoints
router.get('/learner', authenticate, authorize('Learner'), searchController.learnerSearch);
router.get('/employer', authenticate, authorize('Employer'), searchController.employerSearch);
router.get('/issuer', authenticate, authorize('Issuer'), searchController.issuerSearch);
router.get('/admin', authenticate, authorize('Admin'), searchController.adminSearch);

export default router;