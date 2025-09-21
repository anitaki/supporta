const QA = require("../models/qaModel");

/**
 *
 * @param {String} qaId - the MongoDB _id for the QA
 * @param {Array} embedding - an array of number from the OpenAI embedding or the QA
 * @param {ObjectId} businessId - the businessId of the tenant from req.user
 */

const saveQAEmbedding = async function (qaId, embedding, businessId) {
  try {
    const qa = await QA.findOneAndUpdate(
      { _id: qaId, businessId },
      { embedding },
      { new: true, runValidators: true }
    );

    if (!qa) return res.status(404).json({ msg: "Q&A not found" });

    return qa;
  } catch (err) {
     console.error("Error saving embedding:", error.message);
    throw error;
  }
};

module.exports = saveQAEmbedding