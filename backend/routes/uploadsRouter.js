const express = require('express');
const router = express.Router();
const {createQaFromCsv, uploadImage, uploadPdf} = require("../controllers/uploadsController");
const handleMulterError = require("../middleware/handleMulterError")
const authenticateToken = require("../middleware/authToken");
const multer = require("multer");
const {storage, fileFilter} = require("../utils/multer");
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })

router.post('/csv', authenticateToken, upload.single('file'), handleMulterError, createQaFromCsv);
router.post('/image', authenticateToken, upload.single('file'), handleMulterError, uploadImage);
router.post('/pdf', authenticateToken, upload.single('file'), handleMulterError, uploadPdf);

module.exports = router;