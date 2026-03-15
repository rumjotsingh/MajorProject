import { body, param, query, validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Profile validation
export const updateProfileValidation = [
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("skills.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each skill must be a non-empty string"),
  body("location.city").optional().isString().trim(),
  body("location.state").optional().isString().trim(),
  body("location.country").optional().isString().trim(),
  validate,
];

// Credential validation
export const uploadCredentialValidation = [
  body("title")
    .notEmpty()
    .withMessage("Credential title is required")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("nsqLevel")
    .notEmpty()
    .withMessage("NSQ level is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("NSQ level must be between 1 and 10"),
  body("credits")
    .notEmpty()
    .withMessage("Credits are required")
    .isFloat({ min: 0 })
    .withMessage("Credits must be a positive number"),
  body("pathwayId")
    .notEmpty()
    .withMessage("Pathway ID is required")
    .isMongoId()
    .withMessage("Invalid pathway ID"),
  body("institutionId")
    .optional()
    .isMongoId()
    .withMessage("Invalid institution ID"),
  body("certificateUrl")
    .optional()
    .isURL()
    .withMessage("Certificate URL must be valid"),
  body("certificateNumber").optional().trim(),
  body("issueDate")
    .optional()
    .isISO8601()
    .withMessage("Issue date must be a valid date"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  validate,
];

// Pathway validation
export const enrollPathwayValidation = [
  body("pathwayId")
    .notEmpty()
    .withMessage("Pathway ID is required")
    .isMongoId()
    .withMessage("Invalid pathway ID"),
  validate,
];

export const joinInstituteValidation = [
  body("instituteCode")
    .notEmpty()
    .withMessage("Institute code is required")
    .isString()
    .trim()
    .isLength({ min: 4, max: 30 })
    .withMessage("Institute code must be between 4 and 30 characters"),
  body("allowTransfer")
    .optional()
    .isBoolean()
    .withMessage("allowTransfer must be true or false"),
  validate,
];

export const unenrollPathwayValidation = [
  param("pathwayId").isMongoId().withMessage("Invalid pathway ID"),
  validate,
];

// Pagination validation
export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("sort").optional().isString().withMessage("Sort must be a string"),
  validate,
];

// ObjectId validation
export const objectIdValidation = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  validate,
];

// Claim credentials validation
export const claimCredentialsValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  validate,
];

export default {
  updateProfileValidation,
  uploadCredentialValidation,
  enrollPathwayValidation,
  joinInstituteValidation,
  unenrollPathwayValidation,
  paginationValidation,
  objectIdValidation,
  claimCredentialsValidation,
  validate,
};
