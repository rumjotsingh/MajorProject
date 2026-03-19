import mongoose from 'mongoose';

/**
 * Validates if a value is a valid MongoDB ObjectId (handles both string and ObjectId objects)
 * @param {string|ObjectId} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
export const isValidObjectId = (id) => {
  if (!id) {
    return false;
  }
  // Handle both string and ObjectId objects
  if (typeof id === 'string') {
    return mongoose.Types.ObjectId.isValid(id);
  }
  // If it's already an ObjectId object, it's valid
  return mongoose.Types.ObjectId.isValid(id.toString());
};

/**
 * Validates if an ID parameter is valid and throws an error if not
 * @param {string|ObjectId} id - The ID to validate
 * @param {string} fieldName - The name of the field (for error message)
 * @throws {Error} - Throws error if ID is invalid
 */
export const validateObjectId = (id, fieldName = 'ID') => {
  if (!id || !isValidObjectId(id)) {
    const error = new Error(`Invalid ${fieldName}: must be a valid ID`);
    error.statusCode = 400;
    throw error;
  }
};
