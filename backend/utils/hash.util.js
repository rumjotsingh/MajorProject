import crypto from 'crypto';

export const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

export const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};
