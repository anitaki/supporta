const OpenAI = require("openai");
require("dotenv").config();
const QA = require("../models/qaModel");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/**
 * Create an embedding vector for a given input using OpenAI's embeddings API.
 *
 * @param {string|Object} input - The input to embed. Can be:
 *   - A string (e.g., user query or text).
 *   - An object with `question` and `answer` properties for Q&A format.
 * @returns {Promise<number[]>} A promise that resolves to an array of numbers representing the embedding vector.
 */
async function createEmbedding(input) {
  typeof input === "string"
    ? (text = input) // for texts and queries
    : (text = input.question + "\n" + input.answer); // for Q&A format

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}


/**
 *
 * @param {String} Model - the MongoDB Model 
 * @param {String} id - the items id
 * @param {Array} embedding - an array of number from the OpenAI embedding or the QA
 * @param {ObjectId} businessId - the businessId of the tenant from req.user
 */

async function saveEmbedding (model, id, embedding, businessId, session = null) {
  try {
    const doc = await model.findOneAndUpdate(
      { _id: id, businessId },
      { embedding },
      { new: true, runValidators: true, session }
    );

    if (!doc) throw new Error("Document not found");

    return doc;
  } catch (err) {
     console.error("Error saving embedding:", err.message);
    throw err;
  }
};

async function savePdfChunksEmbedding(chunks) {
  const embeddings = [];
  for (let chunk of chunks) {
    const vector = await createEmbedding(chunk);
    embeddings.push({ text: chunk, embedding: vector });
  }
  return embeddings;
}


module.exports = { createEmbedding, saveEmbedding, savePdfChunksEmbedding  };
