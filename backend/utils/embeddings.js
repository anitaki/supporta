const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createEmbedding(input) {
  typeof input === "string"
    ? (text = input) // for texts and queries
    : (text = input.question + "\n" + input.answer); // for Q&A format

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  console.log("🚀 ~ createEmbedding ~ response:", response)

  return response.data[0].embedding;
}

module.exports = { createEmbedding };
