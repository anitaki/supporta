const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createEmbedding(qa) {
  const text = qa.question + "\n" + qa.answer;

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding; // array of numbers
}

module.exports = { createEmbedding };


