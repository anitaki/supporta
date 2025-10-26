const QA = require("../models/qaModel");
const File = require("../models/fileModel");
const DocumentChunk = require("../models/documentChunkModel");
const Message = require("../models/messageModel");
const { createEmbedding } = require("../utils/embedUtils");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const moderateUserInput = require("../utils/openaiUtils");

const searchQAs = async (req, res) => {
  const { q, conversationId } = req.query;
  if (!q) return res.status(400).json({ msg: "Query is required" });

  const moderationWarning = await moderateUserInput(q);
  console.log("🚀 ~ searchQAs ~ moderationWarning:", moderationWarning);
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

  // Get previous chat conversation
  const previousMessages = await Message.find({
    businessId: req.businessId,
    conversationId,
  })
    .sort({ timestamp: 1 })
    .limit(10);

  const chatHistoryObj = {
    type: "chatHistory",
    text: [
      previousMessages.map((msg) =>
        msg.role === "user"
          ? `User: ${msg.content}`
          : `Assistant: ${msg.content}`
      )
    ].join("\n"),
  };
  console.log("🚀 ~ searchQAs ~ chatHistory:", chatHistoryObj);

  // Get response from openAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const combinedResults = [
    ...qaResults,
    ...chunksWithFile,
    ...imageResults,
    chatHistoryObj,
  ];
  console.log("🚀 ~ searchQAs ~ combinedResults:", combinedResults);

  const context = combinedResults
    .map((res) => {
      if (res.type === "qa") return `Q: ${res.question}\nA: ${res.answer}`;
      if (res.type === "chunk")
        return `Document: ${res.file?.title}\nContent: ${res.text}`;
      if (res.type === "image")
        return `Title: ${res.title}\nDescription: ${res?.description}\nURL: ${res.url}`;
      if(res.type === "chatHistory") return `Chat history: ${res.text}`
    })
    .filter(Boolean)
    .join("\n");
  console.log("🚀 ~ searchQAs ~ context:", context);

  const messages = [
    {
      role: "system",
      content: `
You are a helpful support assistant that answers user questions based on available context and previous conversation history. Always respond **in the same language as the user**.

LANGUAGE RULES (CRITICAL):
- Detect the language of the user's question and respond in the same language.
- If the user asks in English, respond ONLY in English.
- If the user asks in Greek, respond ONLY in Greek.
- Never mix languages.
- Translate product names, terms, and context information to match the user's language.
- Even if all context/documentation is in another language, translate relevant information to the user's language.

CONTEXT & MEMORY:
- Use previous messages in the conversation (conversation history) to provide context-aware answers.
- Prioritize answers based on the topic of the conversation (e.g., if the user asked about helmets, follow-up questions relate to helmets).
- Include images from the context, only if they are relevant, up to 3 images per response, using Markdown syntax.

FORMATTING RULES:
- Use Markdown formatting.
- Break text into paragraphs instead of one long line.
- Use bullet points for lists.
- Use **bold** for titles, headings, or key terms.
- Include images with Markdown: ![Alt text](URL).
- When possible include the link to a website, or contact information, for example google maps, viber call, emails etc.

ANSWER GUIDELINES:
- Use provided context (documents, QA pairs, images) to answer the user's question.
- Combine information from multiple context entries if useful.
- Be concise, polite, and clear.
- If no relevant information exists, politely say you don't know, in the user's language.

EXAMPLES:
- User asks "opening hours?" → Respond: "I couldn't find information about opening hours..."
- User asks "ώρες λειτουργίας;" → Respond: "Δεν βρήκα πληροφορίες για τις ώρες λειτουργίας..."
- If user asks "Do you have images?" after previously asking about helmets, only show images of helmets.
`,
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
