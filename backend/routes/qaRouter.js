const express = require("express");
const router = express.Router();

const { getQAs, getAQ, postQA, updateQA, deleteQA } = require("../controllers/qaController");
const searchQAs = require("../controllers/searchController")

const authenticateToken = require("../middleware/authToken");
const validateQA = require("../validations/qaValidation");

router.get("/search", authenticateToken, searchQAs);
router.get("/", authenticateToken, getQAs);
router.get("/:id", authenticateToken, getAQ);
router.post("/qa", authenticateToken, validateQA, postQA);
router.put("/:id", authenticateToken, validateQA, updateQA);
router.delete("/:id", authenticateToken, deleteQA)

module.exports = router;
