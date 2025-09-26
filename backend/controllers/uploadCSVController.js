const QA = require("../models/qaModel");
const { validationResult } = require("express-validator");
const validateObjectId = require("../validations/objectIdValidation");
const saveQAEmbedding = require("../utils/saveQAEmbedding");
const { createEmbedding } = require("../utils/embeddings");
const mongoose = require("mongoose");
const {
  normalizeRow,
  detectSeparator,
  parseCSV,
} = require("../utils/csvHelpers");


const createQaFromCsv = async (req, res) => {
  try {
    console.log(req.file);
    return res.json("Got file");
  } catch (err) {
    return res.json(err);
  }
};

module.exports = createQaFromCsv;
