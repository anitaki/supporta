const QA = require("../models/qaModel");
const saveQAEmbedding = require("../utils/saveQAEmbedding");
const { createEmbedding } = require("../utils/embeddings");
const mongoose = require("mongoose");
const { uploadFileToB2, deleteFileFromB2 } = require("../utils/b2Storage");
const { parseCSV } = require("../utils/csvHelpers");
const path = require("path");

const createQaFromCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "File required" });

  try {
    console.log("reqfile", req.file);

    // Upload csv to B2
    const fileUrl = await uploadFileToB2(req.file);

    // Parse csv
    const filePath = path.resolve(req.file.path); // converts to absolute path with proper separators
    const rows = await parseCSV(filePath);

    // Validate rows
    const validRows = rows.filter((row) => row.question?.trim() && row.answer?.trim());
    console.log("🚀 ~ createQaFromCsv ~ validRows:", validRows)
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
      console.log("🚀 ~ createQaFromCsv ~ row:", row)
      const qa = new QA({
        question: row.question,
        answer: row.answer,
        source: row.source,
        businessId: req.user.businessId,
        createdBy: req.user.id,
        fileUrl,
      });

      await qa.save({ session });

      // Create and save the embedding
      const embedding = await createEmbedding(qa);
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0)
        return res.status(400).json({ msg: "Error embedding your text" });
      await saveQAEmbedding(qa._id, embedding, req.user.businessId, session);

      const qaResponse = qa.toObject();
      qaResponse.embedding = embedding;

      results.push(qaResponse);
    }

    console.log("results" , results)
    await session.commitTransaction();

    res.status(200).json({
      msg: "CSV processed successfully",
      totalRows: rows.length,
      validRows: validRows.length,
      fileUrl,
      data: results,
    });
  } catch (err) {
    await deleteFileFromB2(fileUrl);
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    if (req.file) require("fs").unlinkSync(req.file.path);
  }
};

module.exports = createQaFromCsv;
