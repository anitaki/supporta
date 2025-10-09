const express = require("express");
const router = express.Router();

const { getFiles, getFile, deleteFile } = require("../controllers/fileController");

const authenticateToken = require("../middleware/authToken");

router.get("/", authenticateToken, getFiles);
router.get("/:id", authenticateToken, getFile);
// router.put("/:id", authenticateToken, validateQA, updateQA);
router.delete("/:id", authenticateToken, deleteFile)

module.exports = router;
