const QA = require("../models/qaModel");
const saveQAEmbedding = require("../utils/saveQAEmbedding");
const { createEmbedding } = require("../utils/embeddings");
const mongoose = require("mongoose");

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
        businessId: new mongoose.Types.ObjectId(req.user.businessId)
      }
    }
  },
  
  {
    $project: {
      question: 1,
      answer: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
]);



  res.json(results);
};

module.exports = searchQAs;
