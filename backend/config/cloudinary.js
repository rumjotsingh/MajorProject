import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

export const configureCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    logger.info('Cloudinary configured successfully');
    return cloudinary;
  } catch (error) {
    logger.error('Cloudinary configuration error:', error);
    throw error;
  }
};

export default cloudinary;
