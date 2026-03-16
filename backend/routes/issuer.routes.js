import express from 'express';
const router = express.Router();
import * as issuerController from '../controllers/issuer.controller.js';
import { authenticate, authorize, authenticateIssuer } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.middleware.js';

router.post('/register', authenticate, authorize('Admin'), issuerController.registerIssuer);
router.get('/credentials', authenticateIssuer, issuerController.getIssuerCredentials);
router.post('/credential', authenticateIssuer, validate(schemas.issuerCredential), issuerController.issueCredential);
router.put('/credential/:id', authenticateIssuer, issuerController.updateIssuedCredential);

export default router;
