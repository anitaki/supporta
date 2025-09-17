const mongoose = require("mongoose");
const { Schema } = mongoose;

const businessSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
