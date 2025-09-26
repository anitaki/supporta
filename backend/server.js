const express= require("express");
const app = express()
require("dotenv").config();
const db = require("./config/db")
const cookieParser = require("cookie-parser");

// Routers
const usersRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const businessRouter = require("./routes/businessRouter");
const qaRouter = require("./routes/qaRouter");
const uploadCsvRouter = require("./routes/uploadCsvRouter")

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/business", businessRouter);
app.use("/api/qa", qaRouter);
app.use("/api/upload-csv", uploadCsvRouter)


app.get("/", (_req, res) => {
res.send("Hello and Welcome to Supporta !")
})

app.listen(process.env.PORT, () => {
  console.log(`🌐 Server is listening on http://localhost:${process.env.PORT}`);
});