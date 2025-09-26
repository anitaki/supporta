const express = require('express');
const router = express.Router();
const createQaFromCsv = require("../controllers/uploadsController");
const handleMulterError = require("../middleware/handleMulterError")
const authenticateToken = require("../middleware/authToken");
const multer = require("multer");
const {storage, fileFilter} = require("../utils/multer");
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })

router.post('/csv', authenticateToken, upload.single('file'), handleMulterError, createQaFromCsv);

module.exports = router;