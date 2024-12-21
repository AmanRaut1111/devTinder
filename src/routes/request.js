const express = require("express");
const { userAuth } = require("../middleware/auth");
const User = require("../model/user");
const { Connection, default: mongoose } = require("mongoose");
const connectionRequest = require("../model/connectionRequest");

const requestRouter = express.Router();
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInuser = req.user;

      const fromUserId = loggedInuser._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      console.log(fromUserId);
      const allowedstatus = ["ignored", "interested"];
      if (!allowedstatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status", status: false, statusCode: 400 });
      }

      const isvalidToUser = await User.findById(toUserId);
      if (!isvalidToUser) {
        return res.status(400).json({
          message: "User Is Not Found",
          status: false,
          statusCode: 400,
        });
      }
      const connectionRequestData = new connectionRequest({
        fromUserId: fromUserId,
        toUserId: toUserId,
        status: status,
      });

      const exstingConnection = await connectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { toUserId: fromUserId, fromUserId: toUserId },
        ],
      });

      if (exstingConnection) {
        return res.status(400).json({
          message: "Request is Alredy sent",
          status: false,
          statusCode: 400,
        });
      }

      if (fromUserId.equals(new mongoose.Types.ObjectId(toUserId))) {
        return res.status(400).json({
          message: "You cant sent Request To Yourself",
          status: false,
          statusCode: 400,
        });
      }
      const requestData = await connectionRequestData.save();
      res.status(200).json({
        message: ` ${loggedInuser.firstName} ${status} ${isvalidToUser.firstName}`,
        status: true,
        statusCode: 200,
        data: requestData,
      });
    } catch (error) {
      console.log(error);
      res.send(400).send("Something Went Wrong" + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Status is Not Allowed...!",
          status: false,
          sttausCode: 400,
        });
      }

      const connectionRequestData = await connectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequestData) {
        return res.status(400).json({
          message: "Connection Request is not found...!",
          status: false,
          statusCode: 400,
        });
      }
      connectionRequestData.status = status;
      await connectionRequestData.save();
      res
        .status(200)
        .json({ message: "Request " + status, status: true, statusCode: 200 });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Something went Wrong..!" });
    }
  }
);

module.exports = requestRouter;
