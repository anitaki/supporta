const express= require("express");
const app = express()
require("dotenv").config();
const db = require("./config/db")
const cookieParser = require("cookie-parser");
const cors = require("cors")
const path = require("path")

// Routers
const usersRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const businessRouter = require("./routes/businessRouter");
const qaRouter = require("./routes/qaRouter");
const fileRouter = require("./routes/fileRouter");
const uploadsRouter = require("./routes/uploadsRouter")
const messageRouter = require("./routes/messageRouter")


// Middleware
const allowedOrigins = ["http://localhost:3000", "http://192.168.1.25:3000", "http://localhost:5173", "https://supporta-ai.netlify.app/"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Public static files
app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/chat-widget",
  express.static(path.join(__dirname, "../supporta-widget/dist"))
);

app.get(/^\/chat-widget(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../supporta-widget/dist", "index.html"));
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/business", businessRouter);
app.use("/api/qa", qaRouter);
app.use("/api/file", fileRouter);
app.use("/api/upload", uploadsRouter);
app.use("/api/message", messageRouter);


app.get("/", (_req, res) => {
res.send("Hello and Welcome to Supporta !")
})

app.listen(process.env.PORT, () => {
  console.log(`🌐 Server is listening on http://localhost:${process.env.PORT}`);
});