import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

router.get('/stats', authenticate, authorize('Admin'), adminController.getStats);
router.post('/approve-issuer', authenticate, authorize('Admin'), adminController.approveIssuer);

export default router;
