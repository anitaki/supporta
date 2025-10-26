const QA = require("../models/qaModel");
const { validationResult } = require("express-validator");
const validateObjectId = require("../validations/objectIdValidation");
const { createEmbedding, saveEmbedding } = require("../utils/embedUtils");
const mongoose = require("mongoose");

// Get all Q&As
const getQAs = async (req, res) => {
  const qas = await QA.find({ businessId: req.user.businessId })
    .populate("businessId")
    .populate("createdBy");
  if (qas.length === 0)
    return res.status(404).json({ msg: "There are no Q&As available" });
  res.json(qas);
};

// Get Q&A by id
const getQA = async (req, res) => {
  try {
    const validatedId = validateObjectId(req.params.id);
    if (!validatedId) return res.status(400).json({ msg: "Bad request" });

    const qa = await QA.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    })
      .populate("businessId")
      .populate("createdBy");

    if (!qa) return res.status(400).json({ msg: "Q&A not found" });

    res.json(qa);
  } catch (err) {
       res.status(500).json({ error: "Failed to fetch QAs" });
  }
};

// Create Q&A
const postQA = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array() });

    // Create and save new Q&A
    const { question, answer, source } = req.body;
    const qa = new QA({
      question,
      answer,
      source,
      businessId: req.user.businessId,
      createdBy: req.user.id,
    });

    await qa.save({ session });

    // Create and save the embedding
    const embedding = await createEmbedding(qa);
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0)
      return res.status(400).json({ msg: "Error embedding your text" });
    await saveEmbedding(QA, qa._id, embedding, req.user.businessId, session);

    await session.commitTransaction();

    const qaResponse = qa.toObject();
    qaResponse.embedding = embedding;
    res.status(200).json(qaResponse);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

// Update Q&A by id
const updateQA = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array() });

    const { question, answer, source } = req.body;

    // Create and save the embedding
    const embedding = await createEmbedding(req.body);
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0)
      return res.status(400).json({ msg: "Error embedding your text" });
    await saveEmbedding(QA, req.params.id, embedding, req.user.businessId);

    // Find and update Q&A
    const qa = await QA.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      {
        question,
        answer,
        source,
        businessId: req.user.businessId.Business,
        createdBy: req.user.id,
        embedding,
      },
      { new: true }
    );

    if (!qa) return res.status(404).json({ msg: "Q&A not found" });
    await session.commitTransaction();
    res.status(200).json(qa);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

const deleteQA = async (req, res) => {
  try {
    const qa = await QA.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!qa) return res.status(404).json({ error: "Q&A not found" });
    res.json({ message: "Q&A deleted" });
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = { getQAs, getQA, postQA, updateQA, deleteQA };
