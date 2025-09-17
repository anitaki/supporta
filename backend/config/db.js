const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.MONGO_URI;

main()
  .then(() => {
    console.log("🍃 Connected to MongoDB");
  })
  .catch((err) => console.log("❌ MongoDB connection error", err));

async function main() {
  await mongoose.connect(URI);
}
