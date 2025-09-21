const QA = require("../models/qaModel");

/**
 *
 * @param {String} qaId - the MongoDB _id for the QA
 * @param {Array} embedding - an array of number from the OpenAI embedding or the QA
 * @param {ObjectId} businessId - the businessId of the tenant from req.user
 */

const saveQAEmbedding = async function (qaId, embedding, businessId, session = null) {
  try {
    const qa = await QA.findOneAndUpdate(
      { _id: qaId, businessId },
      { embedding },
      { new: true, runValidators: true, session }
    );

    if (!qa) return res.status(404).json({ msg: "Q&A not found" });

    return qa;
  } catch (err) {
     console.error("Error saving embedding:", err.message);
    throw err;
  }
};

module.exports = saveQAEmbedding