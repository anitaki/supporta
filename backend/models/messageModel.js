const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  conversationId: {
    type: String,
    required: true
  },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
