const File = require("../models/fileModel");
const { validationResult } = require("express-validator");
const validateObjectId = require("../validations/objectIdValidation");
const { createEmbedding, saveEmbedding } = require("../utils/embedUtils");
const mongoose = require("mongoose");

// Get all files
const getFiles = async (req, res) => {
  const files = await File.find({ businessId: req.user.businessId })
    .select({ embedding: 0 })
    .populate("businessId")
    .populate("uploadedBy");
  if (files.length === 0)
    return res.status(404).json({ msg: "There are no files available" });
  res.json(files);
};

// Get file by id
const getFile = async (req, res) => {
  try {
    const validatedId = validateObjectId(req.params.id);
    if (!validatedId) return res.status(400).json({ msg: "Bad request" });

    const file = await File.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    })
      .select({ embedding: 0 })
      .populate("businessId")
      .populate("uploadedBy");

    if (!file) return res.status(400).json({ msg: "File not found" });

    res.json(file);
  } catch (err) {}
};

// Update file by id
// const updateQA = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     //Validate request
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array() });

//     const { question, answer, source } = req.body;

//     // Create and save the embedding
//     const embedding = await createEmbedding(req.body);
//     if (!embedding || !Array.isArray(embedding) || embedding.length === 0)
//       return res.status(400).json({ msg: "Error embedding your text" });
//     await saveEmbedding(QA, req.params.id, embedding, req.user.businessId);

//     // Find and update Q&A
//     const qa = await QA.findOneAndUpdate(
//       { _id: req.params.id, businessId: req.user.businessId },
//       {
//         question,
//         answer,
//         source,
//         businessId: req.user.businessId.Business,
//         createdBy: req.user.id,
//         embedding,
//       },
//       { new: true }
//     );

//     if (!qa) return res.status(404).json({ msg: "Q&A not found" });
//     await session.commitTransaction();
//     res.status(200).json(qa);
//   } catch (err) {
//     await session.abortTransaction();
//     res.status(500).json({
//       msg: "Internal server error",
//       err: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   } finally {
//     session.endSession();
//   }
// };

const deleteFile = async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!file) return res.status(404).json({ error: "File not found" });
    res.json({ message: "Your file was deleted successfully" });
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = { getFiles, getFile, deleteFile };
