const express = require("express");
const router = express.Router();

const { getBusinesses, getBusinessWithToken, getBusinessWithWidgetToken, updateBusiness, deleteBusiness } = require("../controllers/businessController");

const authenticateToken = require("../middleware/authToken");
const authenticateWidgetToken = require("../middleware/authenticateWidgetToken");
const validateBusiness = require("../validations/businessValidation");
const handleMulterError = require("../middleware/handleMulterError")
const multer = require("multer");
const {storage, fileFilter} = require("../utils/multer");
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })


router.get("/all", authenticateToken, getBusinesses);
router.get("/", authenticateToken, getBusinessWithToken);
router.get("/settings", authenticateWidgetToken, getBusinessWithWidgetToken);
router.patch("/", authenticateToken, upload.single('file'), handleMulterError, validateBusiness,  updateBusiness);
// router.delete("/:id", authenticateToken, deleteBusiness);  // for now only from user delete

module.exports = router;