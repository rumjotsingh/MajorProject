import express from 'express';
import * as uploadController from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

// Upload single file
router.post('/single', uploadSingle('file'), handleUploadError, uploadController.uploadSingleFile);

// Upload image
router.post('/image', uploadSingle('image'), handleUploadError, uploadController.uploadImageFile);

// Upload PDF
router.post('/pdf', uploadSingle('pdf'), handleUploadError, uploadController.uploadPDFFile);

// Upload certificate
router.post('/certificate', uploadSingle('certificate'), handleUploadError, uploadController.uploadCertificate);

// Upload multiple files
router.post('/multiple', uploadMultiple('files', 5), handleUploadError, uploadController.uploadMultipleFiles);

// Delete file
router.delete('/:publicId', uploadController.deleteFile);

export default router;
