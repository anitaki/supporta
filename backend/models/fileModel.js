const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  originalName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["pdf", "image"],
    required: true,
  },
  url: {
    // cloud storage link
    type: String,
    required: true,
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ["manual", "system"],
  },
  chunkIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "DocumentChunk",
    },
  ],
  embedding: {
    type: [Number],
    required: false,
  },
});

const fileModel = mongoose.model("File", fileSchema);

module.exports = fileModel;
