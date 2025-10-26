const express = require("express");
const router = express.Router();

const { getQAs, getQA, postQA, updateQA, deleteQA } = require("../controllers/qaController");
const searchQAs = require("../controllers/searchController")

const authenticateWidgetToken = require("../middleware/authenticateWidgetToken");
const authenticateToken = require("../middleware/authToken");
const validateQA = require("../validations/qaValidation");

router.get("/search", authenticateWidgetToken, searchQAs);
router.get("/", authenticateToken, getQAs);
router.get("/:id", authenticateToken, getQA);
router.post("/", authenticateToken, validateQA, postQA);
router.put("/:id", authenticateToken, validateQA, updateQA);
router.delete("/:id", authenticateToken, deleteQA)

module.exports = router;
