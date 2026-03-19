import express from 'express';
const router = express.Router();
import * as verificationController from '../controllers/verification.controller.js';
import upload from '../middleware/upload.middleware.js';

router.post('/upload', upload.single('file'), verificationController.verifyByUpload);
router.get('/by-hash/:hash', verificationController.verifyByHash);
router.get('/status/:id', verificationController.getVerificationStatus);

export default router;
