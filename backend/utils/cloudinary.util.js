import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - Resource type (image, raw, video, auto)
 * @returns {Promise<Object>} - Upload result
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'credentials', resourceType = 'auto') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
          max_file_size: 10485760 // 10MB
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Resource type (image, raw, video)
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

/**
 * Get file URL from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {String} - File URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      ...options
    });
  } catch (error) {
    console.error('Cloudinary URL error:', error);
    throw new Error('Failed to generate Cloudinary URL');
  }
};

/**
 * Upload image with transformations
 * @param {Buffer} fileBuffer - Image buffer
 * @param {String} folder - Cloudinary folder
 * @returns {Promise<Object>} - Upload result
 */
export const uploadImage = async (fileBuffer, folder = 'images') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload PDF document
 * @param {Buffer} fileBuffer - PDF buffer
 * @param {String} folder - Cloudinary folder
 * @returns {Promise<Object>} - Upload result
 */
export const uploadPDF = async (fileBuffer, folder = 'documents') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'raw',
          format: 'pdf'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    throw new Error('Failed to upload PDF');
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
export const extractPublicId = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
  } catch (error) {
    console.error('Extract public ID error:', error);
    return null;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
  uploadImage,
  uploadPDF,
  extractPublicId
};
