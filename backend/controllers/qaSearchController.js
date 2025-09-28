const QA = require("../models/qaModel");
const File = require("../models/fileModel");
const DocumentChunk = require("../models/documentChunkModel");
const { createEmbedding } = require("../utils/embedUtils");
const mongoose = require("mongoose");
const OpenAI = require("openai");

const searchQAs = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ msg: "Query is required" });

  // Embed user query
  const queryEmbedding = await createEmbedding(q);

  // --- Search QA ---
  const qaResults = await QA.aggregate([
    {
      $vectorSearch: {
        index: "qa_embedding_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 5,
        filter: {
          businessId: new mongoose.Types.ObjectId(req.user.businessId),
        },
      },
    },

    {
      $project: {
        type: { $literal: "qa" },
        question: 1,
        answer: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  // --- Search Text Chunks ---
  const chunkResults = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_embedding_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 5,
        filter: {
          businessId: new mongoose.Types.ObjectId(req.user.businessId),
        },
      },
    },
    {
      $project: {
        type: { $literal: "chunk" },
        text: 1,
        fileId: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

    // --- Fetch file info for chunks ---
  const fileIds = chunkResults.map(c => c.fileId);
  const files = await File.find({ _id: { $in: fileIds } });
  const chunksWithFile = chunkResults.map(c => ({
    ...c,
    file: files.find(f => f._id.equals(c.fileId)),
  }));

  // --- Search Images ---
  const imageResults = await File.aggregate([
    {
      $vectorSearch: {
        index: "file_embedding_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 5,
        filter: {
          businessId: new mongoose.Types.ObjectId(req.user.businessId),
          type: "image"
        },
      },
    },
    {
      $project: {
        type: { $literal: "image" },
        title: 1,
        description: 1,
        url: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  // Get response from openAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const combinedResults = [...qaResults, ...chunksWithFile, ...imageResults];

const context = combinedResults
  .map(res => {
    if (res.type === "qa") return `Q: ${res.question}\nA: ${res.answer}`;
    if (res.type === "chunk") return `Document: ${res.file?.title}\nContent: ${res.text}`;
    if(res.type === "image") return `Title: ${res.title}\nDescription: ${res?.description}\nURL: ${res.url}`
  })
  .join("\n");

  const messages = [
    {
      role: "system",
      content: `You are a helpful support assistant.

- Use the provided context to answer the user's question, even if the wording or language is different.
- If the context is in a different language, translate or adapt it so that your final answer matches the language of the user’s question. Also translate any names product names or special terms.
- Combine information from multiple context entries if useful.
- Be concise, polite, and clear.
- If there is truly no relevant information in the context, say you don’t know politely.`,
    },
    {
      role: "user",
      content: `Context: 
      ${context.trim()}
      User question: 
      ${q.trim()}`,
    },
  ];

  const response = await openai.responses.create({
    model: "gpt-4o-mini-2024-07-18",
    input: messages,
    temperature: 1.1,
  });

  console.log(combinedResults);

  res.json(response.output_text);
};

module.exports = searchQAs;
