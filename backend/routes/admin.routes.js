import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

// All routes require Admin authentication
const adminAuth = [authenticate, authorize('Admin')];

// ==================== DASHBOARD ====================
router.get('/dashboard/stats', adminAuth, adminController.getStats);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:id', adminAuth, adminController.getUserById);
router.post('/users/learner', adminAuth, adminController.createLearner);
router.put('/users/learner/:id', adminAuth, adminController.updateLearnerProfile);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// ==================== ISSUER MANAGEMENT ====================
router.get('/issuers', adminAuth, adminController.getIssuers);
router.get('/issuers/:id', adminAuth, adminController.getIssuerById);
router.post('/issuers', adminAuth, adminController.createIssuer);
router.put('/issuers/:id', adminAuth, adminController.updateIssuer);
router.patch('/issuers/:id/approve', adminAuth, adminController.approveIssuer);
router.patch('/issuers/:id/reject', adminAuth, adminController.rejectIssuer);
router.delete('/issuers/:id', adminAuth, adminController.deleteIssuer);

// ==================== EMPLOYER MANAGEMENT ====================
router.get('/employers', adminAuth, adminController.getEmployers);
router.get('/employers/stats', adminAuth, adminController.getEmployerStats);
router.get('/employers/:id', adminAuth, adminController.getEmployerById);
router.post('/employers', adminAuth, adminController.createEmployer);
router.put('/employers/:id', adminAuth, adminController.updateEmployer);
router.patch('/employers/:id/verify', adminAuth, adminController.verifyEmployer);
router.patch('/employers/:id/unverify', adminAuth, adminController.unverifyEmployer);
router.delete('/employers/:id', adminAuth, adminController.deleteEmployer);

// ==================== SUBSCRIPTION MANAGEMENT ====================
router.get('/subscriptions', adminAuth, adminController.getSubscriptions);
router.get('/subscriptions/stats', adminAuth, adminController.getSubscriptionStats);
router.get('/subscriptions/:id', adminAuth, adminController.getSubscriptionById);
router.post('/subscriptions', adminAuth, adminController.createSubscription);
router.put('/subscriptions/:id', adminAuth, adminController.updateSubscription);
router.patch('/subscriptions/:id/cancel', adminAuth, adminController.cancelSubscriptionAdmin);
router.patch('/subscriptions/:id/extend', adminAuth, adminController.extendSubscription);
router.delete('/subscriptions/:id', adminAuth, adminController.deleteSubscription);

// ==================== CREDENTIAL MANAGEMENT ====================
router.get('/credentials', adminAuth, adminController.getCredentials);
router.get('/credentials/:id', adminAuth, adminController.getCredentialById);
router.patch('/credentials/:id/approve', adminAuth, adminController.approveCredential);
router.patch('/credentials/:id/reject', adminAuth, adminController.rejectCredential);
router.delete('/credentials/:id', adminAuth, adminController.deleteCredential);

// ==================== BLOG MANAGEMENT ====================
router.get('/blogs', adminAuth, adminController.getBlogs);
router.get('/blogs/categories', adminAuth, adminController.getBlogCategories);
router.get('/blogs/:id', adminAuth, adminController.getBlogById);
router.post('/blogs', adminAuth, upload.single('coverImage'), adminController.createBlog);
router.put('/blogs/:id', adminAuth, upload.single('coverImage'), adminController.updateBlog);
router.patch('/blogs/:id/publish', adminAuth, adminController.publishBlog);
router.patch('/blogs/:id/unpublish', adminAuth, adminController.unpublishBlog);
router.delete('/blogs/:id', adminAuth, adminController.deleteBlog);

// ==================== NSQF MANAGEMENT ====================
router.get('/nsqf/levels', adminAuth, adminController.getNSQFLevels);
router.post('/nsqf/levels', adminAuth, adminController.createNSQFLevel);
router.put('/nsqf/levels/:id', adminAuth, adminController.updateNSQFLevel);
router.delete('/nsqf/levels/:id', adminAuth, adminController.deleteNSQFLevel);

router.post('/nsqf/map', adminAuth, adminController.createNSQFMapping);
router.get('/nsqf/mappings', adminAuth, adminController.getNSQFMappings);
router.delete('/nsqf/mappings/:id', adminAuth, adminController.deleteNSQFMapping);

// ==================== ANALYTICS ====================
router.get('/analytics/overview', adminAuth, adminController.getAnalyticsOverview);
router.get('/analytics/users', adminAuth, adminController.getAnalyticsUsers);
router.get('/analytics/credentials', adminAuth, adminController.getAnalyticsCredentials);
router.get('/analytics/issuers', adminAuth, adminController.getAnalyticsIssuers);

// Legacy route (kept for backward compatibility)
router.get('/stats', adminAuth, adminController.getStats);
router.post('/approve-issuer', adminAuth, adminController.approveIssuer);

export default router;
