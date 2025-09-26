const QA = require("../models/qaModel");
const saveQAEmbedding = require("../utils/saveQAEmbedding");
const { createEmbedding } = require("../utils/embeddings");
const mongoose = require("mongoose");
const OpenAI = require("openai");

const searchQAs = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ msg: "Query is required" });

  // Embed user query
  const queryEmbedding = await createEmbedding(q);

  // Vector search user query in MongoDB
  const results = await QA.aggregate([
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
        question: 1,
        answer: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  // Get response from openAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const context = results
    .map((res) => `Q: ${res.question}\nA:${res.answer}`)
    .join("\n");

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful support assistant. Answer only using the provided context. Your answers should be polite and well spoken. If the answer is not in the context, say you don't know politely.",
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
    temperature: 1.1
  });

  res.json(response.output_text);
};

module.exports = searchQAs;
