const express = require("express");
const dotenv = require("dotenv");
const twilio = require("twilio");
const http = require("http");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("../src/config/db");
require("dotenv").config();
// require("../src/utils/croneJob");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const commentRouter = require("./routes/comment");

const sendWhatsAppMessage = require("./service/sendWhatsappMessage");
// const paymentRouter = require("./routes/payment");
const intailizeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "10mb" })); // Set the limit to 10MB (adjust as needed)
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
// CORS configuration
// CORS configuration
// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Allow your frontend origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Enable sending cookies
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
// app.use("/", paymentRouter);
app.use("/", chatRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.get("/", async (req, res) => {
  console.log(process.env.UV_THREADPOOL_SIZE);

  res.send("welcome to devTinder..!");
});

intailizeSocket(server);

connectDB()
  .then(() => {
    console.log("Database Connected");

    server.listen(process.env.PORT, () => {
      console.log("server is listening On Port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
