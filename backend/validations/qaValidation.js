const { body } = require("express-validator");
validateQA = [
    body("question")
    .notEmpty()
    .withMessage("Question is required")
    .isString()
    .withMessage("Question must be a string")
    .isLength({ min: 5, max: 255 })
    .withMessage("Question must be between 5–255 characters")
    .trim(),
      body("answer")
    .notEmpty()
    .withMessage("Question is required")
    .isString()
    .withMessage("Question must be a string")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Question must be between 5–2000 characters")
    .trim(),
    body("source")
    .optional()
    .isIn(["manual", "csv", "system"])
    .withMessage("Source must be either 'manual', 'csv', or 'system'."),
]

module.exports = validateQA