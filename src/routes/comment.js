const { status } = require("express/lib/response");
const { userAuth } = require("../middleware/auth");
const blog = require("../model/blog");
const commentModel = require("../model/comment");

const express = require("express");
const { default: mongoose } = require("mongoose");
const commentRouter = express.Router();

commentRouter.post("/comment/add/:id", userAuth, async (req, res) => {
  const { comment } = req.body;
  const loggedInUser = req.user;
  const blogId = req.params.id;
  try {
    const bodyKeys = Object.keys(req.body);

    const isValidBody = bodyKeys.every((key) => key === "comment");

    if (
      !isValidBody ||
      !comment ||
      typeof comment !== "string" ||
      comment.trim() === ""
    ) {
      return res.status(400).json({
        message: "Invalid request. Only a valid 'comment' field is allowed.",
        status: false,
        statusCode: 400,
      });
    }
    const blogData = await blog.findById(blogId);

    if (!blogData) {
      return res.status(403).json({
        message: "Opps....Blog Data Is Not Found...!",
        status: false,
        statusCode: 403,
      });
    }

    const validdata = [comment];

    const check = Object.keys(req.body).every((x) => {
      return x.includes(validdata);
    });

    const newComment = new commentModel({
      userId: loggedInUser._id,
      blogId: blogId,
      comment: comment,
    });

    const commentData = await newComment.save();
    if (commentData) {
      const io = req.app.get("io");
      io.emit("newComment", {
        blogId,
        comment: commentData,
      });
      res.status(200).json({
        message: "Comment Add Sucessfully...!",
        status: true,
        statusCode: 200,
        data: commentData,
      });
    } else {
      res.status(400).json({
        message: "Something Went Wrong...!",
        status: false,
        statusCode: 400,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
      statusCode: 500,
      error: error.message,
    });
  }
});
commentRouter.delete("/comment/delete/:id", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const commentId = req.params.id;

    const commentData = await commentModel.findById(commentId);

    if (!commentData) {
      return res.status(403).json({
        message: "Comment Data is Not found...!",
        status: false,
        statusCode: 403,
      });
    }

    if (commentData.userId.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment.",
        status: false,
        statusCode: 403,
      });
    }

    const deleteComment = await commentModel.findByIdAndDelete(commentId);
    if (deleteComment) {
      res.status(200).json({
        message: "Comment Deleted Sucessfully...!",
        status: true,
        statusCode: 200,
      });
    } else {
      res.status(400).json({
        message: "Something Went wrong...!",
        status: false,
        statsusCode: 400,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
      statusCode: 500,
      error: error.message,
    });
  }
});
commentRouter.put("/comment/update/:id", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  const { comment } = req.body;
  const commentId = req.params.id;

  try {
    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return res.status(400).json({
        message: "Invalid request. Comment must be a non-empty string.",
        status: false,
        statusCode: 400,
      });
    }

    const commentData = await commentModel.findById(commentId);
    if (!commentData) {
      return res.status(403).json({
        message: "Comment not found!",
        status: false,
        statusCode: 403,
      });
    }

    if (commentData.userId.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to edit this comment.",
        status: false,
        statusCode: 403,
      });
    }

    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      {
        $set: { comment, updatedAt: new Date() },
      },
      { new: true }
    );

    if (updatedComment) {
      res.status(200).json({
        message: "Comment updated successfully!",
        status: true,
        statusCode: 200,
        data: updatedComment,
      });
    } else {
      res.status(400).json({
        message: "Something went wrong!",
        status: false,
        statusCode: 400,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
      statusCode: 500,
      error: error.message,
    });
  }
});

commentRouter.get("/comment/getComment/:id", userAuth, async (req, res) => {
  const blogId = req.params.id;
  try {
    const commentData = await commentModel.aggregate([
      {
        $match: {
          blogId: new mongoose.Types.ObjectId(blogId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $project: {
          _id: 1,
          commentOn: 1,
          userName: {
            $concat: [
              {
                $arrayElemAt: ["$userData.firstName", 0],
              },
              " ",
              {
                $arrayElemAt: ["$userData.lastName", 0],
              },
            ],
          },
          comment: 1,
        },
      },
      {
        $sort: {
          commentOn: -1,
        },
      },
    ]);

    if (commentData.length === 0) {
      return res.status(404).json({
        message: "No Comments Found For This Blog..!",
        status: false,
        statusCode: 404,
      });
    }
    if (commentData) {
      res.status(200).json({
        message: "Comments found Sucessfully...!",
        status: true,
        statusCode: 200,
        data: commentData,
        total_Comments: commentData.length,
      });
    } else {
      res.status(400).json({
        message: "Something went wrong!",
        status: false,
        statusCode: 400,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
      statusCode: 500,
      error: error.message,
    });
  }
});

module.exports = commentRouter;
