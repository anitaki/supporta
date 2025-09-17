const express = require("express");
const router = express.Router();

const { getBusinesses, getBusiness, updateBusiness, deleteBusiness } = require("../controllers/businessController");

const authenticateToken = require("../middleware/authToken");
const validateBusiness = require("../validations/businessValidation");

router.get("/", authenticateToken, getBusinesses);
router.get("/:id", authenticateToken, getBusiness);
router.patch("/:id", authenticateToken, validateBusiness, updateBusiness);
// router.delete("/:id", authenticateToken, deleteBusiness);  // for now only from user delete

module.exports = router;