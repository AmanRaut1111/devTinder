const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const Chat = require("../model/chat");

chatRouter.get("/getChat/:targetUserId", userAuth, async (req, res) => {
  const userId = req.user.id;
  const { targetUserId } = req.params;
  try {
    let chatData = await Chat.findOne({
      participants: { $all: [targetUserId, userId] },
    }).populate({ path: "messages.senderId", select: "firstName lastName" });

    if (!chatData) {
      chatData = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chatData.save();
    }
    res.send(chatData);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = chatRouter;
