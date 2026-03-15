import { uploadToCloudinary, deleteFromCloudinary, uploadImage, uploadPDF } from '../utils/cloudinary.util.js';

/**
 * Upload single file
 * @route POST /api/upload/single
 */
export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const folder = req.body.folder || 'uploads';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

/**
 * Upload image
 * @route POST /api/upload/image
 */
export const uploadImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    const folder = req.body.folder || 'images';
    const result = await uploadImage(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

/**
 * Upload PDF document
 * @route POST /api/upload/pdf
 */
export const uploadPDFFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF uploaded'
      });
    }

    const folder = req.body.folder || 'documents';
    const result = await uploadPDF(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF',
      error: error.message
    });
  }
};

/**
 * Upload credential certificate
 * @route POST /api/upload/certificate
 */
export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No certificate uploaded'
      });
    }

    const folder = 'credentials/certificates';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate',
      error: error.message
    });
  }
};

/**
 * Delete file from Cloudinary
 * @route DELETE /api/upload/:publicId
 */
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId, resourceType || 'image');

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

/**
 * Upload multiple files
 * @route POST /api/upload/multiple
 */
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const folder = req.body.folder || 'uploads';
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, folder)
    );

    const results = await Promise.all(uploadPromises);

    const uploadedFiles = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
};

export default {
  uploadSingleFile,
  uploadImageFile,
  uploadPDFFile,
  uploadCertificate,
  deleteFile,
  uploadMultipleFiles
};
