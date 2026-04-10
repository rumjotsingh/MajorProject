import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

router.get('/', authenticate, authorize('Admin'), userController.getAllUsers);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/change-password', authenticate, userController.changePassword);
router.get('/jobs', authenticate, authorize('Learner'), userController.getOpenJobs);
router.post('/jobs/:jobId/apply', authenticate, authorize('Learner'), userController.applyToJob);
router.get('/applications', authenticate, authorize('Learner'), userController.getMyApplications);
router.patch('/applications/:id/withdraw', authenticate, authorize('Learner'), userController.withdrawApplication);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, authorize('Admin'), userController.deleteUser);

export default router;
