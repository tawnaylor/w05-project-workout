const { body, param, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const idRules = [param('id').isMongoId().withMessage('Invalid id'), handleValidation];

const workoutRules = [
  body('name').isString().trim().notEmpty().withMessage('name is required'),
  body('type').isIn(['strength', 'cardio', 'mobility']).withMessage('type must be strength, cardio, or mobility'),
  body('difficulty').isInt({ min: 1, max: 10 }).toInt().withMessage('difficulty must be 1-10'),
  body('durationMinutes').isInt({ min: 1, max: 300 }).toInt().withMessage('durationMinutes must be 1-300'),
  body('xpReward').isInt({ min: 0 }).toInt().withMessage('xpReward must be 0 or more'),
  body('exercises').optional().isArray().withMessage('exercises must be an array'),
  body('exercises.*.name').optional().isString().trim().notEmpty(),
  body('exercises.*.sets').optional().isInt({ min: 1 }).toInt(),
  body('exercises.*.reps').optional().isInt({ min: 1 }).toInt(),
  body('completed').optional().isBoolean().toBoolean(),
  handleValidation
];

const playerRules = [
  body('username').isString().trim().isLength({ min: 3, max: 30 }).withMessage('username must be 3-30 characters'),
  body('displayName').isString().trim().notEmpty().withMessage('displayName is required'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('avatarUrl').optional({ nullable: true }).isURL().withMessage('avatarUrl must be a URL'),
  body('totalXp').optional().isInt({ min: 0 }).toInt(),
  body('level').optional().isInt({ min: 1 }).toInt(),
  handleValidation
];

module.exports = { idRules, playerRules, workoutRules };