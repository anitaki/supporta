const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentChunkSchema = new Schema({
  fileId: {
    type: Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DocumentChunk = mongoose.model("DocumentChunk", documentChunkSchema);
module.exports = DocumentChunk;
