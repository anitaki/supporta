const { body } = require("express-validator");

const validateBusiness = [
  body("name")
    .notEmpty()
    .withMessage("Business name is required")
    .isString()
    .withMessage("Business name must be a string")
    .isLength({ min: 2, max: 255 })
    .withMessage("Business name must be between 2–255 characters")
    .trim()
]

module.exports = validateBusiness;