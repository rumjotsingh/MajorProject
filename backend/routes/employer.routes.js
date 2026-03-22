import express from 'express';
const router = express.Router();
import * as employerController from '../controllers/employer.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

// All routes require Employer authentication
const employerAuth = [authenticate, authorize('Employer')];

// ==================== EMPLOYER PROFILE ====================
router.get('/profile', employerAuth, employerController.getProfile);
router.put('/profile', employerAuth, employerController.updateProfile);

// ==================== DASHBOARD ====================
router.get('/dashboard/stats', employerAuth, employerController.getDashboardStats);

// ==================== SEARCH LEARNERS ====================
router.get('/search', employerAuth, employerController.searchLearners);
router.get('/learners/:id', employerAuth, employerController.getLearnerDetails);

// ==================== BOOKMARK SYSTEM ====================
router.post('/bookmark/:learnerId', employerAuth, employerController.addBookmark);
router.get('/bookmarks', employerAuth, employerController.getBookmarks);
router.delete('/bookmark/:learnerId', employerAuth, employerController.removeBookmark);

// ==================== JOB MANAGEMENT ====================
router.post('/jobs', employerAuth, employerController.createJob);
router.get('/jobs', employerAuth, employerController.getJobs);
router.get('/jobs/:id', employerAuth, employerController.getJobById);
router.put('/jobs/:id', employerAuth, employerController.updateJob);
router.delete('/jobs/:id', employerAuth, employerController.deleteJob);

// ==================== JOB APPLICATIONS ====================
router.get('/jobs/:id/applications', employerAuth, employerController.getJobApplications);
router.patch('/applications/:id/status', employerAuth, employerController.updateApplicationStatus);

// ==================== CREDENTIAL VERIFICATION ====================
router.post('/verify/:credentialId', employerAuth, employerController.verifyCredential);

export default router;
