import express from 'express';
const router = express.Router();
import * as contactController from '../controllers/contact.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

// Public route - submit contact form
router.post('/submit', contactController.submitContact);

// Admin routes
const adminAuth = [authenticate, authorize('Admin')];

router.get('/', adminAuth, contactController.getAllContacts);
router.get('/stats', adminAuth, contactController.getContactStats);
router.get('/:id', adminAuth, contactController.getContactById);
router.patch('/:id', adminAuth, contactController.updateContactStatus);
router.delete('/:id', adminAuth, contactController.deleteContact);

export default router;
