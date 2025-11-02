const { body } = require("express-validator");

const validateBusiness = [
  body("name")
    .notEmpty()
    .withMessage("Business name is required")
    .isString()
    .withMessage("Business name must be a string")
    .isLength({ min: 1, max: 255 })
    .withMessage("Business name must be between 1–255 characters")
    .trim(),

  body("widgetToken")
    .optional()
    .isString()
    .withMessage("Token must be a string")
    .isLength({ min: 64, max: 140 })
    .withMessage("Token must be 64-14 characters")
    .notEmpty()
    .withMessage("Token is required")
    .trim(),

  body("logo")
    .optional()
    .isString()
    .withMessage("Logo name must be a string")
    .isLength({ min: 1, max: 255 })
    .withMessage("Logo name must be between 1–255 characters")
    .trim(),

  body("color")
    .optional()
    .isString()
    .withMessage("Color name must be a string")
    .isLength({ min: 1, max: 255 })
    .withMessage("Color name must be between 1–255 characters")
    .trim(),

  body("font")
    .optional()
    .isString()
    .withMessage("Font name must be a string")
    .isLength({ min: 1, max: 255 })
    .withMessage("Font name must be between 1–255 characters")
    .trim(),

  body("greeting")
    .optional()
    .isString()
    .withMessage("Greeting name must be a string")
    .isLength({ min: 1, max: 255 })
    .withMessage("Greeting name must be between 1–255 characters")
    .trim(),

  body("theme")
    .optional()
    .isString()
    .withMessage("Theme name must be a string")
    .isIn(["light", "dark", "auto"])
    .withMessage("Theme must be one of: light, dark, or auto")
    .trim(),
];

module.exports = validateBusiness;
