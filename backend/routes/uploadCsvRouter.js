const express = require('express');
const router = express.Router();
const createQaFromCsv = require("../controllers/uploadCSVController");
const handleMulterError = require("../middleware/handleMulterError")
const multer = require("multer");
const {storage, fileFilter} = require("../utils/multer");
const upload = multer({ storage: storage, fileFilter: fileFilter })

router.post('/', upload.single('file'), handleMulterError, createQaFromCsv);

module.exports = router;