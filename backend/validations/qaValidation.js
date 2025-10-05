const { body } = require("express-validator");
validateQA = [
    body("question")
    .notEmpty()
    .withMessage("Question is required")
    .isString()
    .withMessage("Question must be a string")
    .isLength({ min: 1, max: 255 })
    .withMessage("Question must be between 1–255 characters")
    .trim(),
      body("answer")
    .notEmpty()
    .withMessage("Answer is required")
    .isString()
    .withMessage("Answer must be a string")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Answer must be between 1–2000 characters")
    .trim(),
    body("source")
    .optional()
    .isIn(["manual", "csv", "system"])
    .withMessage("Source must be either 'manual', 'csv', or 'system'."),
]

module.exports = validateQA