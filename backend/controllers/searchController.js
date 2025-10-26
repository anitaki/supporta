const QA = require("../models/qaModel");
const File = require("../models/fileModel");
const DocumentChunk = require("../models/documentChunkModel");
const { createEmbedding } = require("../utils/embedUtils");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const moderateUserInput = require("../utils/openaiUtils");

const searchQAs = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ msg: "Query is required" });

  const moderationWarning = await moderateUserInput(q);
  console.log("🚀 ~ searchQAs ~ moderationWarning:", moderationWarning)
  if (moderationWarning) {
    return res.status(400).json({ msg: moderationWarning });
  }

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
          businessId: new mongoose.Types.ObjectId(req.businessId),
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
          businessId: new mongoose.Types.ObjectId(req.businessId),
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
  const fileIds = chunkResults.map((c) => c.fileId);
  const files = await File.find({ _id: { $in: fileIds } });
  const chunksWithFile = chunkResults.map((c) => ({
    ...c,
    file: files.find((f) => f._id.equals(c.fileId)),
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
          businessId: new mongoose.Types.ObjectId(req.businessId),
          type: "image",
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
    .map((res) => {
      if (res.type === "qa") return `Q: ${res.question}\nA: ${res.answer}`;
      if (res.type === "chunk")
        return `Document: ${res.file?.title}\nContent: ${res.text}`;
      if (res.type === "image")
        return `Title: ${res.title}\nDescription: ${res?.description}\nURL: ${res.url}`;
    })
    .filter(Boolean)
    .join("\n");
  console.log("🚀 ~ searchQAs ~ context:", context)

  const messages = [
    {
      role: "system",
      content: `You are a helpful support assistant.

LANGUAGE RULES (CRITICAL):
- ALWAYS detect the language of the user's question first
- ALWAYS respond in the EXACT same language as the user's question
- If user asks in English, respond ONLY in English
- If user asks in Greek, respond ONLY in Greek
- NEVER mix languages in your response
- Even if all context/documentation is in Greek, if the user asks in English, translate everything to English
- Translate product names, terms, and all information to match the user's language
- If context is in different language than user's question, translate the relevant information

ANSWER GUIDELINES:
- Use the provided context to answer the user's question
- Combine information from multiple context entries if useful
- Be concise, polite, and clear
- If no relevant information exists in context, politely say you don't know (in the user's language)

EXAMPLES:
- User asks "opening hours?" → Respond in English: "I couldn't find information about opening hours..."
- User asks "ώρες λειτουργίας;" → Respond in Greek: "Δεν βρήκα πληροφορίες για τις ώρες λειτουργίας..."`,
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
    temperature: 1,
  });

  res.json(response.output_text);
};

module.exports = searchQAs;
