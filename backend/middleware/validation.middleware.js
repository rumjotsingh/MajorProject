import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('Learner', 'Issuer', 'Employer', 'Admin').default('Learner'),
    mobile: Joi.string().pattern(/^\d{10}$/).optional().messages({
      'string.pattern.base': 'Mobile number must be exactly 10 digits'
    }),
    companyName: Joi.string().min(2).max(200).optional(),
    institutionName: Joi.string().min(2).max(200).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    bio: Joi.string().max(500).allow('').optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().allow('').optional(),
        institution: Joi.string().allow('').optional(),
        year: Joi.string().allow('').optional(),
        fieldOfStudy: Joi.string().allow('').optional(),
      })
    ).optional(),
    experience: Joi.array().items(
      Joi.object({
        role: Joi.string().allow('').optional(),
        company: Joi.string().allow('').optional(),
        duration: Joi.string().allow('').optional(),
        description: Joi.string().allow('').optional(),
      })
    ).optional(),
    preferences: Joi.object({
      language: Joi.string().optional(),
      notificationsEnabled: Joi.boolean().optional(),
    }).optional(),
  }),

  credentialMetadata: Joi.object({
    title: Joi.string().required(),
    issuer: Joi.string().required(),
    issueDate: Joi.date().required(),
    skills: Joi.array().items(Joi.string()).default([]),
    credits: Joi.number().integer().min(1).max(40).required().messages({
      'number.base': 'Credits must be a number',
      'number.integer': 'Credits must be an integer',
      'number.min': 'Credits must be at least 1',
      'number.max': 'Credits cannot exceed 40',
      'any.required': 'Credits field is required',
    }),
    // nsqfLevel is NOT accepted from user input - it's calculated automatically
  }),

  issuerCredential: Joi.object({
    userEmail: Joi.string().email().required(),
    title: Joi.string().required(),
    skills: Joi.array().items(Joi.string()).default([]),
    credits: Joi.number().integer().min(1).max(40).required().messages({
      'number.base': 'Credits must be a number',
      'number.integer': 'Credits must be an integer',
      'number.min': 'Credits must be at least 1',
      'number.max': 'Credits cannot exceed 40',
      'any.required': 'Credits field is required',
    }),
    issueDate: Joi.date().required(),
    certificateUrl: Joi.string().uri().optional(),
    // nsqfLevel is NOT accepted - it's calculated automatically based on total credits
  }),

  employerRegister: Joi.object({
    companyName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};
