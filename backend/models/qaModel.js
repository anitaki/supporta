const mongoose = require("mongoose");
const { Schema } = mongoose;

const qaSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    source: {
      type: String,
      enum: ["manual", "csv", "system"],
      default: "manual",
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    embedding: {
        type: [Number],
        required: false
    }
  },
  { timestamps: true }
);

const QA = mongoose.model("QA", qaSchema);

module.exports = QA;
