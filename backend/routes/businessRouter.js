const express = require("express");
const router = express.Router();

const { getBusinesses, getBusinessWithToken, getBusinessWithWidgetToken, updateBusiness, deleteBusiness } = require("../controllers/businessController");

const authenticateToken = require("../middleware/authToken");
const authenticateWidgetToken = require("../middleware/authenticateWidgetToken");
const validateBusiness = require("../validations/businessValidation");

router.get("/all", authenticateToken, getBusinesses);
router.get("/", authenticateToken, getBusinessWithToken);
router.get("/settings", authenticateWidgetToken, getBusinessWithWidgetToken);
router.patch("/", authenticateToken, validateBusiness, updateBusiness);
// router.delete("/:id", authenticateToken, deleteBusiness);  // for now only from user delete

module.exports = router;