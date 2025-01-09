const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("../src/config/db");
require("dotenv").config();

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const commentRouter = require("./routes/comment");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("io", io);

app.use(express.json({ limit: "10mb" })); // Set the limit to 10MB (adjust as needed)
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
// CORS configuration
// CORS configuration
// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Allow your frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Include PATCH method
  allowedHeaders: ["Content-Type", "Authorization"], // Headers your client might send
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions)); // Respond to preflight (OPTIONS) requests
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", blogRouter);
app.use("/", commentRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.get("/", (req, res) => {
  res.send("Welcome to DevTinder");
});
connectDB()
  .then(() => {
    console.log("Database Connected");

    app.listen(process.env.PORT, () => {
      console.log("server is listening On Port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
