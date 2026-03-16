import Credential from '../models/Credential.model.js';
import Verification from '../models/Verification.model.js';
import { generateFileHash } from '../utils/hash.util.js';
import VerificationService from '../services/verification.service.js';

// POST /verify/upload
export const verifyByUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File required' });
    }

    const hash = generateFileHash(req.file.buffer);
    const credential = await Credential.findOne({ certificateHash: hash });

    if (!credential) {
      return res.status(404).json({ valid: false, details: 'Certificate not found' });
    }

    res.json({
      valid: true,
      details: 'Match found',
      credentialId: credential._id,
    });
  } catch (error) {
    next(error);
  }
};

// GET /verify/by-hash/:hash
export const verifyByHash = async (req, res, next) => {
  try {
    const { hash } = req.params;
    const credential = await Credential.findOne({ certificateHash: hash }).populate(
      'issuerId',
      'name'
    );

    if (!credential) {
      return res.status(404).json({ valid: false, message: 'Hash not found' });
    }

    res.json({
      valid: true,
      credentialId: credential._id,
      issuer: credential.issuerId.name,
      title: credential.title,
    });
  } catch (error) {
    next(error);
  }
};

// GET /verify/status/:id
export const getVerificationStatus = async (req, res, next) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const verification = await Verification.findOne({ credentialId: credential._id }).sort({
      createdAt: -1,
    });

    res.json({
      credentialId: credential._id,
      status: credential.verificationStatus,
      method: verification?.method || 'unknown',
      details: verification?.resultDetails || '',
    });
  } catch (error) {
    next(error);
  }
};

