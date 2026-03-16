import express from 'express';
const router = express.Router();
import * as credentialController from '../controllers/credential.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimit.middleware.js';

router.post('/upload', authenticate, authorize('Learner'), uploadLimiter, upload.single('file'), credentialController.uploadCredential);
router.get('/', authenticate, authorize('Learner', 'Admin'), credentialController.getMyCredentials);
router.get('/:id', authenticate, credentialController.getCredentialById);
router.put('/:id', authenticate, credentialController.updateCredential);
router.delete('/:id', authenticate, credentialController.deleteCredential);
router.get('/:id/download', authenticate, credentialController.downloadCredential);
router.post('/:id/verify', authenticate, credentialController.triggerVerification);

export default router;
