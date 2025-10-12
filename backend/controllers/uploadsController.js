const QA = require("../models/qaModel");
const File = require("../models/fileModel");
const DocumentChunk = require("../models/documentChunkModel");
const {
  createEmbedding,
  saveEmbedding,
  savePdfChunksEmbedding,
} = require("../utils/embedUtils");
const mongoose = require("mongoose");
const { uploadFileToB2, deleteFileFromB2 } = require("../utils/b2Storage");
const { parseCSV } = require("../utils/csvUtils");
const path = require("path");
const fs = require("fs");
const { extractTextFromPdf, chunkText } = require("../utils/pdfUtils");

const createQaFromCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "File required" });

  try {
    // Parse csv
    const filePath = path.resolve(req.file.path); // converts to absolute path with proper separators
    const rows = await parseCSV(filePath);

    // Validate Greek content is saved properly as utf8 csv
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("�")) {
      return res.status(400).json({
        msg: "CSV contains invalid characters. Please save it as UTF-8 (CSV UTF-8 in Excel).",
      });
    }

    // Validate rows
    const validRows = rows.filter(
      (row) => row.question?.trim() && row.answer?.trim()
    );
    const invalidRows = rows.filter((row) => !row.question || !row.answer);
    if (validRows.length === 0) {
      return res
        .status(400)
        .json({ msg: "No valid rows found in CSV", invalidRows });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const results = [];

    // Create and save new Q&A
    for (let row of validRows) {
      const qa = new QA({
        question: row.question,
        answer: row.answer,
        source: row.source,
        businessId: req.user.businessId,
        createdBy: req.user.id,
      });

      await qa.save({ session });

      // Create and save the embedding
      const embedding = await createEmbedding(qa);
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0)
        return res.status(400).json({ msg: "Error embedding your text" });
      await saveEmbedding(QA, qa._id, embedding, req.user.businessId, session);

      const qaResponse = qa.toObject();
      qaResponse.embedding = embedding;

      results.push(qaResponse);
    }

    await session.commitTransaction();

    res.status(200).json({
      msg: "CSV processed successfully",
      totalRows: rows.length,
      validRows: validRows.length,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    if (req.file) require("fs").unlinkSync(req.file.path);
  }
};

const uploadImage = async (req, res) => {
  let fileUrl;
  if (!req.file) return res.status(400).json({ msg: "File required" });
  const session = await mongoose.startSession();

  try {
    // Upload image to B2
    const fileUrl = await uploadFileToB2(req.file);

    // Start transaction
    session.startTransaction();

    // Create and save new File
    const file = new File({
      originalName: req.file.originalname,
      type: "image",
      url: fileUrl,
      title: req.body.title,
      description: req.body.description || "",
      businessId: req.user.businessId,
      uploadedBy: req.user.id,
      source: "manual",
    });

    await file.save({ session });

    // Create and save the embedding
    const embedding = await createEmbedding(file);
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0)
      return res.status(400).json({ msg: "Error embedding your text" });
    await saveEmbedding(
      File,
      file._id,
      embedding,
      req.user.businessId,
      session
    );

    await session.commitTransaction();

    const fileResponse = file;
    fileResponse.embedding = embedding;

    res.status(200).json({
      msg: "Image processed successfully",
      data: fileResponse,
    });
  } catch (err) {
    if (fileUrl) await deleteFileFromB2(fileUrl);
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    if (req.file) require("fs").unlinkSync(req.file.path);
  }
};

const uploadPdf = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "File required" });

  const session = await mongoose.startSession();
  try {
    const filePath = path.resolve(req.file.path);

    // Upload file to cloud
    const fileUrl = await uploadFileToB2(req.file);

    // Start transaction
    session.startTransaction();

    // Save File metadata
    const file = new File({
      originalName: req.file.originalname,
      type: "pdf",
      url: fileUrl,
      title: req.body.title,
      description: req.body.description || "",
      businessId: req.user.businessId,
      uploadedBy: req.user.id,
      source: "manual",
    });

    await file.save({ session });

    // Extract text & chunk
    const pdfText = await extractTextFromPdf(filePath);
    const chunks = chunkText(pdfText, 2000); // chunk size adjustable
    const chunkIds = [];

    // Create embeddings & save each chunk
    for (let chunkText of chunks) {
      const embedding = await createEmbedding(chunkText);
      const documentChunk = new DocumentChunk (
        {
          fileId: file._id,
          businessId: req.user.businessId,
          text: chunkText,
          embedding,
        },
      );

      await documentChunk.save({ session});
      chunkIds.push(documentChunk._id);
    }

    file.chunkIds = chunkIds;
    await file.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      msg: "PDF uploaded and chunked successfully",
      fileUrl,
      fileId: file._id,
      chunks: chunks.length,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    session.endSession();
    if (req.file) fs.unlinkSync(req.file.path);
  }
};

const updateFile = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();

  try {
    const existingFile = await File.findById(id);
    console.log("🚀 ~ updateFile ~ existingFile:", existingFile)
    if (!existingFile)
      return res.status(404).json({ msg: "File not found" });

    session.startTransaction();

    const updates = {
      title: req.body.title,
      description: req.body.description,
    };
    console.log("🚀 ~ updateFile ~ updates:", updates)

    // If a new file is uploaded
    if (req.file) {
      // Delete old file from B2
      if (existingFile.url) await deleteFileFromB2(existingFile.url);

      // Upload new file
      const newFileUrl = await uploadFileToB2(req.file);
      updates.url = newFileUrl;
      updates.originalName = req.file.originalname;

      const isPdf = req.file.mimetype === "application/pdf";
      updates.type = isPdf ? "pdf" : "image";

      // Handle embeddings
      if (isPdf) {
        // Delete old chunks
        await DocumentChunk.deleteMany({ fileId: existingFile._id });

        const filePath = path.resolve(req.file.path);
        const pdfText = await extractTextFromPdf(filePath);
        const chunks = chunkText(pdfText, 2000);
        const chunkIds = [];

        for (let chunkText of chunks) {
          const embedding = await createEmbedding(chunkText);
          const documentChunk = new DocumentChunk({
            fileId: existingFile._id,
            businessId: req.user.businessId,
            text: chunkText,
            embedding,
          });
          await documentChunk.save({ session });
          chunkIds.push(documentChunk._id);
        }

        updates.chunkIds = chunkIds;
      } else {
        // Recreate embedding for image
        const embedding = await createEmbedding(req.file);
        await saveEmbedding(File, existingFile._id, embedding, req.user.businessId, session);
      }
    }

    // Apply updates
    const updatedFile = await File.findByIdAndUpdate(id, updates, { new: true, session });
    console.log("🚀 ~ updateFile ~ updatedFile:", updatedFile)

    await session.commitTransaction();

    res.status(200).json({
      msg: "File updated successfully",
      data: updatedFile,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Error updating file:", err);
    res.status(500).json({ msg: "Internal server error", error: err.message });
  } finally {
    session.endSession();
    if (req.file) fs.unlinkSync(req.file.path);
  }
};


module.exports = { createQaFromCsv, uploadImage, uploadPdf, updateFile };
