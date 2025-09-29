const express= require("express");
const app = express()
require("dotenv").config();
const db = require("./config/db")
const cookieParser = require("cookie-parser");
const cors = require("cors")

// Routers
const usersRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const businessRouter = require("./routes/businessRouter");
const qaRouter = require("./routes/qaRouter");
const uploadsRouter = require("./routes/uploadsRouter")

// Middleware
const allowedOrigins = ["http://localhost:3000", "http://192.168.1.25:3000"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/business", businessRouter);
app.use("/api/qa", qaRouter);
app.use("/api/upload", uploadsRouter)


app.get("/", (_req, res) => {
res.send("Hello and Welcome to Supporta !")
})

app.listen(process.env.PORT, () => {
  console.log(`🌐 Server is listening on http://localhost:${process.env.PORT}`);
});