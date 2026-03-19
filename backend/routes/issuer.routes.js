import express from 'express';
const router = express.Router();
import * as issuerController from '../controllers/issuer.controller.js';
import { authenticate, authorize, authenticateIssuer } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.middleware.js';

// Admin routes
router.post('/register', authenticate, authorize('Admin'), issuerController.registerIssuer);

// Issuer user routes (for logged-in issuers)
router.get('/dashboard/credentials', authenticate, authorize('Issuer'), issuerController.getIssuerCredentials);
router.get('/profile', authenticate, authorize('Issuer'), issuerController.getIssuerProfile);
router.put('/profile', authenticate, authorize('Issuer'), issuerController.updateIssuerProfile);
router.get('/learners', authenticate, authorize('Issuer'), issuerController.getIssuerLearners);
router.get('/learners/:id', authenticate, authorize('Issuer'), issuerController.getLearnerDetails);
router.get('/pending-verifications', authenticate, authorize('Issuer'), issuerController.getPendingVerifications);
router.put('/verify/:credentialId', authenticate, authorize('Issuer'), issuerController.verifyCredential);

// API key routes (for external issuer systems)
router.get('/credentials', authenticateIssuer, issuerController.getIssuerCredentials);
router.post('/credential', authenticateIssuer, validate(schemas.issuerCredential), issuerController.issueCredential);
router.put('/credential/:id', authenticateIssuer, issuerController.updateIssuedCredential);

export default router;
