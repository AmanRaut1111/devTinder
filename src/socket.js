const io = require("./app"); // Import io after the server is created

// Socket events
io.on("connection", (socket) => {
  console.log("user is connected");

  socket.on("chat", (message) => {
    console.log(message);
    io.emit("chat", message);
  });
});
