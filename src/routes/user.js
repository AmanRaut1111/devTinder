const express = require("express");
const User = require("../model/user");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../model/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/request", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestData = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "gender"]);

    console.log(connectionRequestData);

    res
      .status(200)
      .json({ message: "Request found", data: connectionRequestData });
  } catch (error) {
    console.error("Error retrieving connection requests:", error.message);

    res.status(500).json({
      message: "An error occurred while retrieving connection requests.",
      error: error.message, // Optional: for development/debugging
      status: false,
      statusCode: 500,
    });
  }
});

userRouter.get("/user/getConnections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionData = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName"])
      .populate("toUserId", ["firstName", "lastName"]);
    const data = connectionData.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }

      return row.fromUserId;
    });

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong..!" });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    let limit = req.query.limit;
    // limit = limit > 3 ? 2 : limit;
    const loggedInUser = req.user;
    const connectionData = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");
    const hideFromfeed = new Set();

    connectionData.forEach((req) => {
      hideFromfeed.add(req.fromUserId.toString());
      hideFromfeed.add(req.toUserId.toString());
    });

    // console.log(hideFromfeed);

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideFromfeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName about skills")
      .skip((page - 1) * limit)
      .limit(limit);

    res.send(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "somethng Went Wrong" });
  }
});

module.exports = userRouter;
