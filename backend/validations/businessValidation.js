const { body } = require("express-validator");

const validateBusiness = [
  body("name")
    .notEmpty()
    .withMessage("Business name is required")
    .isString()
    .withMessage("Business name must be a string")
    .isLength({ min: 2, max: 255 })
    .withMessage("Business name must be between 2–255 characters")
    .trim(),

      body("widgetToken")
    .isString()
    .withMessage("Token must be a string")
    .isLength({ min: 64, max: 140 })
    .withMessage("Token must be 64-14 characters")
    .notEmpty()
    .withMessage("Token is required")
    .trim(),
]

module.exports = validateBusiness;
