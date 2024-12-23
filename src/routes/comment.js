const { status } = require("express/lib/response");
const { userAuth } = require("../middleware/auth");
const blog = require("../model/blog");
const commentModel = require("../model/comment");

const express = require("express");
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
  const comment = req.body.comment;
  const commentId = req.params.id;
  try {
    const commentData = await commentModel.findById(commentId);
    if (!commentData) {
      return res.status(403).json({
        message: "Comment Not Found..!",
        status: false,
        statsusCode: 403,
      });
    }

    if (commentData.userId.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to Edit this comment.",
        status: false,
        statusCode: 403,
      });
    }

    const updateComent = await commentModel.findByIdAndUpdate(
      commentId,
      {
        $set: { comment, updatedAt: new Date() },
      },
      { new: true }
    );

    if (updateComent) {
      res.status(200).json({
        message: "Comment Updated Sucessfully...!",
        status: true,
        statsusCode: 200,
        data: updateComent,
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

module.exports = commentRouter;
