import { body, validationResult } from "express-validator";

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

const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-])[a-z\d@$!%*?&#^()_+=-]{8,}$/,
    )
    .withMessage(
      "Password must contain lowercase, number and special character",
    ),
  body("role")
    .isIn(["learner", "institute", "employer"])
    .withMessage("Invalid role"),
  validate,
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  validate,
];

const resetPasswordValidation = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-])[a-z\d@$!%*?&#^()_+=-]{8,}$/,
    )
    .withMessage(
      "Password must contain lowercase, number and special character",
    ),
  validate,
];

export {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  validate,
};
