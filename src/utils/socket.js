const socket = require("socket.io");
const Chat = require("../model/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join chat room based on user IDs
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      if (!userId || !targetUserId) {
        return socket.emit("error", "Invalid user IDs");
      }
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
      console.log(`${firstName} joined room ${roomId}`);
    });

    // Handle sending a message
    socket.on(
      "sendMessage",
      async ({ text, firstName, lastName, userId, targetUserId }) => {
        try {
          // Ensure message and necessary user IDs are provided
          if (!text || !userId || !targetUserId) {
            return socket.emit("error", "Invalid message data");
          }

          const roomId = [userId, targetUserId].sort().join("_");

          // Find or create chat between the users
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            // Create a new chat document if it doesn't exist
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          // Create the message object
          const message = {
            senderId: userId,
            text,
            timestamp: new Date(),
          };

          // Push the message into the chat
          chat.messages.push(message);
          await chat.save();

          // Emit message to the room (real-time message broadcasting)
          io.to(roomId).emit("messageReceived", {
            text,
            firstName,
            lastName,
            time: message.timestamp.toLocaleTimeString(),
          });
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", "Internal server error while sending message");
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // Handle any socket errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

module.exports = initializeSocket;
