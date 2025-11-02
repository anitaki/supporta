const mongoose = require("mongoose");
const { Schema } = mongoose;
const backendUrl = process.env.BACKEND_DOMAIN;

const businessSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  widgetToken: {
    type: String,
    default: () => require("crypto").randomBytes(64).toString("hex"),
  },
  logo: {
    type: String,
    default: `${backendUrl}/logo.png`,
  },
  color: {
    type: String,
    default: "rgba(103, 58, 183, 1)", 
  },
  font: {
    type: String,
    default: "Inter, Helvetica, sans-serif",
  },
  greeting: {
    type: String,
    default: "Hello 👋! How can I help you today?",
  },
});

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
